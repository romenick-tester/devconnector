import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { getUserProfileById, getUserRepos } from "../manager";
import { About, Edu, Exp, Repos, Header } from "../components";

function SingleProfileDisplay({ match }) {
    const userId = match.params.id;

    const dispatch = useDispatch();
    const {
        profile_byId_loading: loading,
        profile_byId_error: error,
        profile_byId: profile
    } = useSelector(state => state.user_byId);

    const {
        repos_loading,
        repos_error,
        github_repos: repos
    } = useSelector(state => state.repos);

    useEffect(() => {
        dispatch(getUserProfileById(userId))
    }, [userId, dispatch]);

    useEffect(() => {
        if (profile.githubusername) {
            dispatch(getUserRepos(profile.githubusername));
        }
    }, [profile, dispatch]);

    if (loading) {
        return <h4>Loading...</h4>
    }

    if (error) {
        return <h4>Error...</h4>
    }

    const {
        bio = "", company = "", education = [], experience = [], githubusername = "",
        location = "", skills = [], social = {}, status = "", user = {} } = profile;
    
    const header = { status, company, location };

    return (
        <>
            <Link to="/profiles" className="btn btn-light">Back To Profiles</Link>

            <div className="profile-grid my-1">
                <Header {...header} user={user} social={social} />

                <About skills={skills} bio={bio} user={user} />

                <Exp experience={experience} />

                <Edu education={education} />

                {repos_loading ? <h4>Loading... </h4> : repos_error ? <h4>Repos not available... </h4> : repos && (
                    <Repos githubusername={githubusername} repos={repos} />
                )}
            </div>
        </>
    )
}

export default SingleProfileDisplay;
