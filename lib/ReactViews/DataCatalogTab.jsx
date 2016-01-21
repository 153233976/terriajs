'use strict';
var React = require('react');
var DataCatalogGroup = require('./DataCatalogGroup.jsx');
var DataPreview = require('./DataPreview.jsx');
var SearchBox = require('./SearchBox.jsx');

// The DataCatalog Tab
var DataCatalogTab = React.createClass({
    propTypes: {
      terria:  React.PropTypes.object
    },

    getInitialState() {
        return {
            previewed: undefined,
            notSearching: true
        };
    },

    componentWillMount() {
      var that = this;
      //Update preview app if an item has been added as previewed
      window.previewUpdate.addEventListener(function(_previewed) {
          that.setState({
              previewed: _previewed
          });
      });
    },

    onPreviewChange(){

    },

    checkSearch(_notSearching){
      this.setState({
        notSearching: _notSearching
      });
    },

    renderDataCatalog(dataCatalog){
      if(this.state.notSearching === true){
          return (<ul className = 'list-reset data-catalog'>
              {dataCatalog.map((group, i)=>{
                return (<DataCatalogGroup group={group} key={i}/>);
              }, this)}
            </ul>);
        }
    },

    render() {
        const terria = this.props.terria;
        const dataCatalog = terria.catalog.group.items;
        return (
            <div className="panel-content clearfix">
              <div className="search-data col col-6">
                <SearchBox terria = {terria} mapSearch = {false} gazetterSearch={false} callback={this.checkSearch}/>
                {this.renderDataCatalog(dataCatalog)}
              </div>
              <div className="data-preview preview col col-6 block">
                <DataPreview terria = {terria} previewed={this.state.previewed} />
              </div>
            </div>
        );
    }
});

module.exports = DataCatalogTab;
