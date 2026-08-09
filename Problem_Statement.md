# Problem Statement

## 1. Title
Freelancer Hiring and Project Management Platform

## 2. Domain
Freelancing / Online Recruitment / Project Management

## 3. Who is the user?

The system has three types of users:

1. Client – Posts projects, reviews freelancer proposals, hires freelancers, manages projects and milestones, and provides reviews.
2. Freelancer – Creates a professional profile, searches for projects, submits proposals, completes hired projects, and receives reviews.
3. Admin – Manages users, monitors projects, handles reports and disputes, and oversees platform activities.

## 4. What problem are we solving?

Clients often struggle to find reliable freelancers with the required skills, experience, budget, and availability. At the same time, freelancers face difficulty in finding suitable projects and demonstrating their skills and credibility.

The lack of a structured hiring and project management process can lead to skill mismatches, unclear project requirements, poor communication, delayed work, and payment-related issues.

For example, a client who needs a website developer may receive multiple proposals but may find it difficult to compare freelancers based on their skills, experience, ratings, proposed cost, and delivery time.

This project aims to provide a centralized platform where clients can post projects, freelancers can discover suitable opportunities and submit proposals, and both parties can manage the complete project lifecycle from hiring to milestone completion and review.

## 5. Proposed Solution

The proposed Freelancer Hiring and Project Management Platform will provide:

- Secure user registration and role-based login.
- Freelancer profiles containing skills, experience, portfolio, availability, and pricing.
- Client project posting with requirements, required skills, budget, category, and deadline.
- Project search and filtering based on skills, category, budget, and deadline.
- Freelancer proposal submission with proposed price, delivery time, and cover letter.
- Client-side proposal comparison and freelancer selection.
- Contract creation after successful hiring.
- Milestone-based project management.
- Freelancer submission of completed milestone work.
- Client approval or revision requests for submitted work.
- Milestone payment tracking.
- Project-based messaging between clients and freelancers.
- Notifications for proposals, hiring, milestones, messages, and approvals.
- Ratings and reviews after project completion.
- Admin management of users, projects, reports, disputes, and platform activities.

## 6. Core Entities / Database Tables

The system will contain the following database tables:

1. Users
2. Freelancer_Profile
3. Skills
4. Freelancer_Skills
5. Projects
6. Proposals
7. Contracts
8. Milestones
9. Payments
10. Reviews
11. Messages
12. Notifications

These tables will have meaningful relationships to support the complete workflow from project creation to freelancer hiring, milestone completion, payment tracking, and reviews.

## 7. User Roles & Permissions

### Client
- Register and login.
- Create, update, and manage projects.
- Search and view freelancer profiles.
- View and compare proposals.
- Hire freelancers.
- Create and manage project milestones.
- Approve or request revisions for submitted work.
- Track milestone payments.
- Communicate with freelancers.
- Rate and review freelancers.

### Freelancer
- Register and login.
- Create and manage professional profiles.
- Add skills and portfolio information.
- Search and filter available projects.
- Submit proposals.
- Track proposal status.
- Accept contracts.
- Manage assigned milestones.
- Submit completed work.
- Communicate with clients.
- Track payment status.
- Rate and review clients.

### Admin
- Manage users and accounts.
- Monitor projects and proposals.
- Monitor contracts and platform activities.
- Handle reported users and content.
- Manage disputes.
- Monitor payment-related activities.

## 8. Success Criteria

The system will be considered successful if:

- A client can create and publish a project with requirements, skills, budget, and deadline.
- A freelancer can search for suitable projects and submit proposals.
- A client can compare proposals and hire a freelancer.
- A hired project can be converted into a contract.
- A project can be divided into multiple milestones.
- A freelancer can submit milestone work for client approval.
- A client can approve the work or request revisions.
- Payment status can be tracked for each milestone.
- Clients and freelancers can communicate through the platform.
- Completed projects support ratings and reviews.
- Role-based access prevents unauthorized actions.
- Notifications are generated for important project events.

## 9. Out of Scope

The following features are outside the scope of the initial version:

- Real-money withdrawal to bank accounts.
- International currency conversion.
- Video calling.
- Native Android/iOS application.
- Advanced tax and invoice management.
- Automated legal contract generation.
- Government-level identity verification.
- Fully automated dispute resolution.

These features may be considered in future versions.

## 10. Chosen Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Java Spring Boot
- Database: MySQL
- Communication: REST APIs
- Version Control: Git and GitHub

### Future AI Scope

An AI-based freelancer recommendation feature can be added in a later phase. The system can analyze project requirements and freelancer profiles to recommend suitable freelancers based on skills, experience, ratings, budget, availability, and previous project performance.