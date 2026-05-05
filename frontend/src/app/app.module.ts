import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CardDashboardComponent } from './card-dashboard/card-dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { AccountComponent } from './account/account.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { TagsComponent } from './tags/tags.component';
import { CardPreviewComponent } from './card-preview/card-preview.component';
import { WelcomeService } from './services/welcome.service';
import { AuthService } from './services/auth.service';
import { CardsService } from './services/cards.service';
import { TagsService } from './services/tags.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CardDashboardComponent,
    SettingsComponent,
    AccountComponent,
    LoginComponent,
    SignupComponent,
    TagsComponent,
    CardPreviewComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [WelcomeService, AuthService, CardsService, TagsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
