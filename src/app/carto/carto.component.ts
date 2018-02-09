// https://scotch.io/tutorials/mean-app-with-angular-2-and-the-angular-cli
// https://github.com/patricknee/d3-angular2-force-drag-zoom-pan/blob/master/src/app/force-canvas/force-canvas.component.ts
// https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartoService } from './carto.service';
import * as d3 from "d3";
import d3Tip from "d3-tip";

@Component( {
    selector: 'app-carto',
    templateUrl: './carto.component.html',
    styleUrls: ['./carto.component.css'],
    encapsulation: ViewEncapsulation.None // https://stackoverflow.com/questions/38798002/angular-2-styling-not-applying-to-child-component
} )
export class CartoComponent implements OnInit {
    private carto: any;
    private svg: any;
    private chartLayer: any;
    //private width: number;
    //private height: number;
    private chartWidth: number;
    private chartHeight: number;
    private circleRadius: number = 40;
    private simulation: any;
    private margin = { top: 0, left: 0, bottom: 0, right: 0 };
    private blue: string = '#337ab7';
    private green: string = '#5cb85c';
    private yellow: string = '#f0ad4e';
    private blueText: string = '#4ab1eb';
    private purple: string = '#9467bd';

    constructor( private cartoService: CartoService, private route: ActivatedRoute ) { }

    ngOnInit() {
        this.svg = d3.select( "#graph" ).append( "svg" )
        this.chartLayer = this.svg.append( "g" ).classed( "chartLayer", true )

        var sub = this.route.params.subscribe( params => {
            if ( params['id'] ) {
                // Retrieve carto from the API
                this.cartoService.getCarto( params['id'] ).subscribe( carto => {
                    this.carto = carto;
                    this.setSize();
                    this.startForceGraph();
                } );
            }
        } );
    }

    setSize() {
        var width = document.querySelector( "#graph" ).clientWidth;
        var height = document.querySelector( "#graph" ).clientHeight;

        this.chartWidth = width - ( this.margin.left + this.margin.right );
        this.chartHeight = height - ( this.margin.top + this.margin.bottom );

        this.svg.attr( "width", width ).attr( "height", height );
        this.chartLayer
            .attr( "width", this.chartWidth )
            .attr( "height", this.chartHeight )
            .attr( "transform", "translate(" + [this.margin.left, this.margin.top] + ")" )
    }

    startForceGraph() {
        this.simulation = d3.forceSimulation( this.carto.nodes )
            .force( "link", d3.forceLink( this.carto.links ).distance( this.circleRadius * 4 ).strength( 1 ) )
            .force( "collide", d3.forceCollide(( d ) => { return this.circleRadius * 3 } ).iterations( 16 ) )
            .force( "charge", d3.forceManyBody() )
            .force( "center", d3.forceCenter( this.chartWidth / 2, this.chartHeight / 2 ) );
        // .force( "y", d3.forceY( 0 ) )
        //.force( "x", d3.forceX( 0 ) );

        var link = this.svg.selectAll( ".link" )
            .data( this.carto.links )
            .enter()
            .append( "line" )
            .attr( "stroke", "#999" );

        var node = this.svg.selectAll( ".node" )
            .data( this.carto.nodes )
            .enter()
            .append( "g" ) // Need to move the group else circles would be on top, left of the screen + see node.transform in tick function
            .attr( "transform", ( d ) => { return "translate(" + ( this.chartWidth / 2 ) + "," + ( this.chartHeight / 2 ) + ")" } )
            .call( d3.drag()
                .on( "start", () => {
                    if ( !d3.event.active ) this.simulation.alphaTarget( 0.3 ).restart();
                    var coord = this.getEdgesLimitCoord( d3.event.subject.x, d3.event.subject.y );
                    d3.event.subject.fx = coord.x;
                    d3.event.subject.fy = coord.y;
                } )
                .on( "drag", () => {
                    var coord = this.getEdgesLimitCoord( d3.event.x, d3.event.y );
                    d3.event.subject.fx = coord.x;
                    d3.event.subject.fy = coord.y;
                } )
                .on( "end", () => {
                    if ( !d3.event.active ) this.simulation.alphaTarget( 0 );
                    var coord = this.getEdgesLimitCoord( d3.event.x, d3.event.y );
                    d3.event.subject.fx = coord.x;
                    d3.event.subject.fy = coord.y;
                } ) )
            .on( 'mouseover', ( d ) => {
                tipNodes.show( d );
            } ) //Tooltip node
            .on( 'mouseout', ( d ) => {
                tipNodes.hide( d );
            } ); //Tooltip node

        node.append( "circle" )
            .attr( "r", ( d ) => { return this.circleRadius; } )
            .style( "fill", this.blue );
        //.attr( "stroke", "#e6e6fa" )

        //Set up tooltip for nodes (display the component infos)
        var tipNodes = d3Tip()
            .attr( 'class', 'tooltip-box' )
            .offset( [-5, 0] )
            .html(( d ) => {
                var nodeTooltip = '';
                nodeTooltip += ( d.flowCode ? '<b style="color:' + this.blueText + '">Flow: </b> ' + d.flowCode + '<br><br>' : '' ) +
                    '<b style="color:' + this.blueText + '">Component Name :</b> ' + d.componentName + '</b><br>' +
                    '<b style="color:' + this.blueText + '">Service Name :</b> ' + d.serviceName + '</b><br>';
                return '<div class="tooltip-text-container frame"><div class="tooltip-text wordwrap">' + nodeTooltip + '</div></div>';
            } );
        this.svg.call( tipNodes );

        node.append( "text" )
            //.attr( 'dx', '-1.2em' )
            .attr( "dx", "0" )
            .attr( "dy", "0" )
            .style( "text-anchor", "middle" )
            .append( 'tspan' )
            .text( function( d ) { return d.componentName; } );

        this.simulation
            .on( "tick", () => {
                link
                    .attr( "x1", function( d ) { return d.source.x; } )
                    .attr( "y1", function( d ) { return d.source.y; } )
                    .attr( "x2", function( d ) { return d.target.x; } )
                    .attr( "y2", function( d ) { return d.target.y; } );

                node
                    .attr( "cx", function( d ) { return d.x; } )
                    .attr( "cy", function( d ) { return d.y; } )
                    .attr( "transform", function( d ) {
                        return "translate(" + d.x + "," + d.y + ")";
                    } );
            } );
    }

    private getEdgesLimitCoord( x, y ) {
        var xRes = x;
        var yRes = y;

        if ( x < this.margin.left + this.circleRadius ) {
            xRes = this.margin.left + this.circleRadius;
        }
        if ( x > this.margin.left + this.chartWidth - this.circleRadius ) {
            xRes = this.margin.left + this.chartWidth - this.circleRadius;
        }
        if ( y < this.margin.top + this.circleRadius ) {
            yRes = this.margin.top + this.circleRadius;
        }
        if ( y > this.margin.top + this.chartHeight - this.circleRadius ) {
            yRes = this.margin.top + this.chartHeight - this.circleRadius;
        }
        return { x: xRes, y: yRes };
    }
}