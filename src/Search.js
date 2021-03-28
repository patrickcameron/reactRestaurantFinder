import React from 'react';
const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

class Search extends React.Component {

    constructor() {
        super();
        this.state = {
            searchTerm: '',
            searchResults: [],
            foundRestaurants: [],
            debouncer: false,
            cityDetails: {},
            openNow: true,
            keyword: ''
        }

        this.changeOpenNow = this.changeOpenNow.bind(this);
        this.fetchCityList = this.fetchCityList.bind(this);
        this.fetchCityDetails = this.fetchCityDetails.bind(this);
        this.fetchRestaurants = this.fetchRestaurants.bind(this);
        this.setCity = this.setCity.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateKeyword = this.updateKeyword.bind(this);
        this.handleKeywordSubmit = this.handleKeywordSubmit.bind(this);
    }

    changeOpenNow() {
        this.setState({
            openNow: !this.state.openNow
        });
        this.fetchRestaurants();
    }

    fetchCityList(searchTerm) {
        fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&types=(cities)&input=${searchTerm}`)
            .then(res => res.json())
            .then(res => {
                this.setState({
                    searchResults: res.predictions
                })
            });
    }

    fetchCityDetails(placeId) {
        fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKey}&place_id=${placeId}`)
            .then(res => res.json())
            .then(res => {
                this.setState({ cityDetails: res.result });
                this.fetchRestaurants();
            });
    }

    fetchRestaurants() {
        const openNow = this.state.openNow ? '&opennow' : '';
        const keyword = this.state.keyword ? `&keyword=${this.state.keyword}` : '';
        const cityCoordinates = this.state.cityDetails.geometry.location;

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${apiKey}&location=${cityCoordinates.lat},${cityCoordinates.lng}&radius=1000&type=restaurant${openNow}${keyword}`;

        fetch(url)
            .then(res => res.json())
            .then(res => {
                console.log(res.results);
                this.setState({
                    foundRestaurants: res.results
                })
            });
    }

    setCity(e) {
        const placeID = e.target.dataset.placeId;
        this.fetchCityDetails( placeID );
    }

    handleChange(e) {
        if(e.target.value === '') {
            this.setState({ searchResults: [] });
        }

        this.setState({ searchTerm: e.target.value });
        this.fetchCityList(e.target.value);

        if (!this.state.debouncer) {
            this.setState({debouncer: true});
            setTimeout(() => {
                this.setState({
                    debouncer: false
                })
            }, 500);
        }
    }

    handleKeywordSubmit(e) {
        e.preventDefault();
        this.fetchRestaurants();
    }

    updateKeyword(e) {
        this.setState({keyword: e.target.value});
    }

    render() {
        return (
            <>

                <form onSubmit={(e) => e.preventDefault()}>
                    <label>
                        City:
                        <input type="search" value={this.state.searchTerm} onChange={this.handleChange}></input>
                    </label>
                </form>
            
                <form onSubmit={this.handleKeywordSubmit}>
                    <label>
                        Keyword:
                        <input type="search" value={this.state.keyword} onChange={this.updateKeyword}></input>
                    </label>
                    <label>
                        Open Now
                        <input type="checkbox" checked={this.state.openNow} onChange={this.changeOpenNow}></input>
                    </label>
                </form>
            
                {/* <h2>{this.state.searchTerm}</h2> */}
                {/* <h3>{JSON.stringify(this.state.cityDetails)}</h3> */}

                {this.state.searchResults.length !== 0 &&
                    <div>
                        <h3>Cities:</h3>
                        <ul>
                            {this.state.searchResults.map((result, index) => {
                                return (
                                    <li 
                                        key={index} 
                                        data-place-id={result.place_id}
                                        onClick={this.setCity}
                                    >
                                        {result.description}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                }

                {Object.keys(this.state.cityDetails).length !== 0 &&
                    <div>
                        <h3>Restaurants:</h3>
                        <ul>
                            {this.state.foundRestaurants.map( (result, index) => {
                                return (
                                    <li key={index}>
                                        <p>{result.name}</p>
                                        <p>{result.vicinity}</p>
                                        <p>{result.rating}</p>
                                    </li>
                                )
                            }) }
                        </ul>
                    </div>
                }
            </>
        )
    }
}

export default Search;