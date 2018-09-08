import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';

interface Movies {
    movie_title: any;
    director_name: any;
    actor_1_name: any;
    actor_2_name: any;
    genres: any;
    language: any;
    country: any;
    content_rating: any;
    budget: any;
    title_year: any;
    plot_keywords: any;
    movie_imdb_link: any;
}

@Component({
    selector: 'app-movie',
    templateUrl: './movies.component.html'
})


export class MoviesComponent implements OnInit {
    static FULLMOVIES;
    @ViewChild('moviename') seachInput: ElementRef;
    private url: any;
    moviesArray: Array<any>;
    private _dataListArr: Array<string>;
    _movieYearsArr;
    _movieLangArr;
    _movieGenreArr;
    _movieCountry;
    isAutoComp: boolean;
    dataListArr;
    isLoading: boolean;
    _sortOptionArr: Array<any>;
    p = 1;

    constructor(private bkSvc: BackendService) {
        this.url = 'http://starlord.hackerearth.com/movieslisting';
        this.moviesArray = [];
        this._movieYearsArr = [''];
        this._movieLangArr = [''];
        this._movieGenreArr = [''];
        this.isAutoComp = false;
        this._dataListArr = [];
        this.dataListArr = [];
        this._movieCountry = [''];
        this.isLoading = true;
        this._sortOptionArr = [{text: '' , option: ''},
                                //{text: 'Genres ↑' , option: 'genres'},
                                // {text: 'Genres down' , option: 'genres'},
                                // {text: 'Language ↑' , option: 'language'},
                                // {text: 'Language down' , option: 'language'},
                                // {text: 'Country ↑' , option: 'country'},
                                // {text: 'Country down' , option: 'country'},
                                {text: 'Budget ↑' , option: 'budget|up'},
                                {text: 'Budget ↓' , option: 'budget|down'},
                                {text: 'Year ↑' , option: 'title_year|up'},
                                {text: 'Year ↓' , option: 'title_year|down'}];
    }

    ngOnInit() {
        this.bkSvc.getData(this.url)
            .subscribe((data: any) => {
                this.moviesArray = (!!data && data.length > 0) ? data : null;
                MoviesComponent.FULLMOVIES = JSON.parse(JSON.stringify(this.moviesArray));
                this.moviesArray.forEach((m: Movies) => {
                    if ((this._movieYearsArr.indexOf(m.title_year) < 0) && m.title_year.trim() !== '') {
                        this._movieYearsArr.push(m.title_year);
                    }
                    if ((this._movieLangArr.indexOf(m.language) < 0) && m.language.trim() !== '') {
                        this._movieLangArr.push(m.language);
                    }
                    if ((this._movieCountry.indexOf(m.country) < 0) && m.country.trim() !== '') {
                        this._movieCountry.push(m.country);
                    }
                    if (m.genres.trim() !== '') {
                        const _genre = m.genres.split('|');
                        for (const g of _genre) {
                            if (this._movieGenreArr.indexOf(g) < 0) {
                                this._movieGenreArr.push(g);
                            }
                        }
                    }
                    //console.log(this._movieGenreArr);
                    this._dataListArr.push(m.movie_title.trim());
                });
                this._movieYearsArr = this._movieYearsArr.sort((a, b) => {
                    return a - b;
                });
                this._movieLangArr.sort();
                this._movieCountry.sort();
                this._movieGenreArr.sort();
                this.isLoading = false;
            },
                (error: any) => {
                    console.error(error);
                });

        const keyword = fromEvent(this.seachInput.nativeElement, 'input')
            .pipe(
                map((e: KeyboardEvent) => e.target['value']),
                tap(text => this.isAutoComp = (text.length < 3) ? false : true),
                filter(text => text.length > 2),
                debounceTime(1000)
            )
            .subscribe(val => {
                this.isAutoComp = true;
                this.typeAhead(val.trim().toLowerCase());
            });
    }

    filter() {
        this.isLoading = true;
        (<any>document.querySelector('#sort')).options[0].selected = 'selected';
        const filterArr = [];
        let arr: Array<any> = [];

        const filterYr = (<any>document.querySelector('#filteryr'))
                    .options[(<any>document.querySelector('#filteryr')).selectedIndex].value.trim().toLowerCase();
        filterArr.push({name: 'filterYr', val: filterYr});

        const filterLang = (<any>document.querySelector('#filterlang'))
                    .options[(<any>document.querySelector('#filterlang')).selectedIndex].value.trim().toLowerCase();
        filterArr.push({name: 'filterLang', val: filterLang});

        const filterCont = (<any>document.querySelector('#filtercont'))
                    .options[(<any>document.querySelector('#filtercont')).selectedIndex].value.trim().toLowerCase();
        filterArr.push({name: 'filterCont', val: filterCont});

        const filterGen = (<any>document.querySelector('#filtergen'))
                    .options[(<any>document.querySelector('#filtergen')).selectedIndex].value.trim().toLowerCase();
        filterArr.push({name: 'filterGen', val: filterGen});


        arr = JSON.parse(JSON.stringify(MoviesComponent.FULLMOVIES));
        console.log(filterArr);

        filterArr.forEach(param => {
            if (param.name  === 'filterYr' && param.val !== '') {
                arr = arr.filter((m: Movies) => {
                    return (m.title_year.trim().toLowerCase() === param.val);
                });
            }
            if (param.name  === 'filterLang' && param.val !== '') {
                arr = arr.filter((m: Movies) => {
                    return (m.language.trim().toLowerCase() === param.val);
                });
            }
            if (param.name  === 'filterCont' && param.val !== '') {
                arr = arr.filter((m: Movies) => {
                    return (m.country.trim().toLowerCase() === param.val);
                });
            }
            if (param.name  === 'filterGen' && param.val !== '') {
                arr = arr.filter((m: Movies) => {
                    return (m.genres.trim().toLowerCase().indexOf(param.val) > -1);
                });
            }
        });

        this.moviesArray = arr;
        this.isLoading = false;
    }

    sorting(e: any) {
        if (e.trim() === '') {
            this.moviesArray = JSON.parse(JSON.stringify(MoviesComponent.FULLMOVIES));
            return;
        }
        const name = e.split('|')[0];
        const param = e.split('|')[1];
        this.isLoading = true;

        this.moviesArray = this.moviesArray.sort((a, b) => {

            if (name === 'title_year') {
                return (param === 'up') ? (a.title_year - b.title_year) : (b.title_year - a.title_year);
            }
            if (name === 'budget') {
                return (param === 'up') ? (a.budget - b.budget) : (b.budget - a.budget);
            }
        });
        this.isLoading = false;
    }

    search(movietile) {
        this.isLoading = true;
        movietile = movietile.value;
        if (movietile.trim() === '') {
            this.isLoading = false;
            return;
        }
        this.moviesArray = JSON.parse(JSON.stringify(MoviesComponent.FULLMOVIES));
        this.moviesArray = this.moviesArray.filter((m: Movies) => {
            return (m.movie_title.trim().toLowerCase() === movietile.trim().toLowerCase());
        });
        (<any>document.querySelector('#filteryr')).options[0].selected = 'selected';
        (<any>document.querySelector('#filterlang')).options[0].selected = 'selected';
        (<any>document.querySelector('#filtercont')).options[0].selected = 'selected';
        (<any>document.querySelector('#filtergen')).options[0].selected = 'selected';

        (<any>document.querySelector('#sort')).options[0].selected = 'selected';

        this.isLoading = false;
    }
    reset() {
        this.moviesArray = JSON.parse(JSON.stringify(MoviesComponent.FULLMOVIES));
        this.dataListArr = [];
        this.seachInput.nativeElement.value = '';
        (<any>document.querySelector('#filteryr')).options[0].selected = 'selected';
        (<any>document.querySelector('#filterlang')).options[0].selected = 'selected';
        (<any>document.querySelector('#filtercont')).options[0].selected = 'selected';
        (<any>document.querySelector('#filtergen')).options[0].selected = 'selected';

        (<any>document.querySelector('#sort')).options[0].selected = 'selected';
        return;
    }

    theme(e) {
        if (e.target.checked) {
            (<any>document.querySelector('.main')).style.background = 'rgba(95, 184, 152, 0.95)';
            (<any>document.querySelector('.header')).style.background = '#000000db';
            (<any>document.querySelector('.header')).style.color = '#fff';
            (<any>document.querySelector('.filter')).style.background = '#b14848';
        } else {
            (<any>document.querySelector('.main')).style.background = 'none';
            (<any>document.querySelector('.header')).style.background = '#0e0e0e52';
            (<any>document.querySelector('.header')).style.color = '#000';
            (<any>document.querySelector('.filter')).style.background = '#e9ecef';
        }
    }

    private typeAhead(text: any) {
        const tempArr = [];
        this._dataListArr.forEach((m: string) => {
            if ((m.toLowerCase().indexOf(text)) > -1) {
                tempArr.push({name: m, index: m.toLowerCase().indexOf(text)});
            }
        });

        tempArr.sort((a: any, b: any) => {
            return (a.index - b.index);
        });
        tempArr.forEach((a: any, b: any) => {
            return (a.index - b.index);
        });

        this.dataListArr = (tempArr.length > 0 ) ? [] : this.dataListArr;
        for (const item of tempArr) {
            this.dataListArr.push(item.name);
            if (this.dataListArr.length === 10) {
                break;
            }
        }
    }
}

