import { Component, OnInit, ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { MatSlider } from '@angular/material/slider';

@Component({
    selector: 'app-dishdetail',
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

    dish: Dish;
    dishIds: string[];
    next: string;
    prev: string;
    feedbackForm: FormGroup;
    feedback: Feedback;
    contactType = ContactType;
    ratingValue: any;
    public sliderValue: number = 0;
    @ViewChild('fform') feedbackFormDirective;

    formErrors = {
        'author': '',
        'comment': ''
    };

    validationMessages = {
        'author': {
            'required': "Author's name is required.",
            'minlength': "Author's name must be at list 2 characters long.",
            'maxlength': "Author's name cannot be more than 35 characters"
        },
        'comment': {
            'required': 'Comment is required.'
        }
    };
    constructor(private dishService: DishService,
                private location: Location,
                private route: ActivatedRoute,
                private fb: FormBuilder) {
                    this.createForm()
                }

    public emitSliderValue(sliderValue: number): void {
        this.sliderValue = sliderValue;
    }

    ngOnInit(): void {
        this.dishService.getDishIds()
            .subscribe((dishIds) => this.dishIds = dishIds);

        this.route.params
            .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
            .subscribe(dish => {this.dish = dish; this.setPrevNext(dish.id)} );
    }

    setPrevNext(dishId: string) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
    }

    goBack(): void {
        this.location.back();
    }

    createForm() {
        let d = new Date();
        let date = d.getDate();
        let month = d.getMonth() -1;
        const months = [
            'Jan',
            'Feb',
            'Nar',
            'Apr',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];
        let year = d.getFullYear();
        let dateStr = months[month] + " " + date + ", " + year;
        this.feedbackForm = this.fb.group({
            author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
            comment: ['', [Validators.required]],
            rating: this.sliderValue,
            date: dateStr
        });
        this.feedbackForm.valueChanges
            .subscribe(data => this.onValueChange(data));

        this.onValueChange(); {
            const form = this.feedbackForm.getRawValue() as Comment
            console.log(form);
        };  //(re)set form validation messages

    }
    onValueChange(data?: any) {
        if (!this.feedbackForm) {return;}
        const form = this.feedbackForm;
        for(const field in this.formErrors) {
            if(this.formErrors.hasOwnProperty(field)) {
            //clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    if (control.errors.hasOwnProperty(key)) {
                    this.formErrors[field] += messages[key] + ' ';
                    }
                }
            }
        }
    }
}
    onSubmit() {
        console.log(this.feedback);
        this.dish.comments.push(this.feedbackForm.value)
        this.feedbackForm.reset({
            author: '',
            comment: ''
        });
        this.feedbackFormDirective.resetForm();
    }
}

