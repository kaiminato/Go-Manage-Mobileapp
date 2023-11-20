import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
    providedIn: 'root'
})
export class AuthUserService {
    idToken: string = ''; // Store the ID Token
    accessToken: string = ''; // Store the Access Token

    constructor(private authService: AuthService) { }

    handleAuthentication(): void {
        // Import the module into the application, with configuration
        this.authService.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
            if (isAuthenticated) {
                // Get the ID Token
                this.authService.idTokenClaims$.subscribe((claims: any) => {
                    this.idToken = claims.__raw; // Store the ID Token
                });

                // Get the Access Token
                this.authService.getAccessTokenSilently().subscribe(
                    (token: string) => {
                        this.accessToken = token; // Store the Access Token
                        // Use the Access Token for API calls or other purposes
                    },
                    (error: any) => {
                        console.error('Error fetching Access Token:', error);
                        // Handle errors while fetching Access Token
                    }
                );

                // Retrieve user profile using getUser() method
                this.authService.getUser().subscribe(
                    (user: any) => {
                        // Store the user profile or perform actions with it
                    },
                    (error: any) => {
                        console.error('Error fetching user profile:', error);
                        // Handle errors while fetching user profile
                    }
                );
            }
        });

        this.authService.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
            if (!isAuthenticated) {
                this.authService.loginWithRedirect(); // Trigger login only if not authenticated
            }
        });
    }
}
