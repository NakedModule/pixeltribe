import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

import { AngularFireAuth } from "@angular/fire/compat/auth";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore";

import {Observable, of, switchMap} from "rxjs";
import {User} from "./User";
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    user$: Observable<User>;

  constructor(
    private afStore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
            if(user) {
                return this.afStore.doc<User>(`users/${user.uid}`).valueChanges();
            } else {
                return of(null as any);
            }
        })
      )
  }

    async googleSignIn() {
        const provider = new firebase.auth.GoogleAuthProvider();
        const credential = await this.afAuth.signInWithPopup(provider);
        return this.updateUserData(credential.user);
    }

    private updateUserData(user: any) {
        // Sets user data to firestore on login
        const userRef: AngularFirestoreDocument<User> = this.afStore.doc(`users/${user.uid}`);

        const data = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoUrl: user.photoUrl,
            emailVerified: user.emailVerified
        }

        return userRef.set(data, { merge: true })

    }

    async signOut() {
        await this.afAuth.signOut();
        await this.router.navigate(['/']);
    }
}
