const { validationResult } = require("express-validator");
const axios = require("axios");
const normalize = require("normalize-url");
const dotenv = require("dotenv");
const { User, Profile } = require("../settings");

dotenv.config();

//route:        PUT api/profile/experience
//desc:         add or update user profile experience
//access:       private 
const addProfileExperience = async(req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
}

//route:        DELETE api/profile/experience/exp_id
//desc:         delete user profile experience
//access:       private 
const deleteProfileExperience = async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.experience.map((exp) => exp.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
      console.error(err.message);
        return res.status(500).send('There was a problem with the server, please try again.');
    }
}

//route:        PUT api/profile/education
//desc:         add or update user profile education
//access:       private 
const addProfileEducation = async(req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        level,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        level,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
}

//route:        DELETE api/profile/education/edu_id
//desc:         delete user profile education
//access:       private 
const deleteProfileEducation = async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.education.map((edu) => edu.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
}

//route:        POST api/profile
//desc:         create or update user profile
//access:       private 
const createUserProfile = async(req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        ...rest
    } = req.body;

    const profileFields = {
        user: req.user.id,
        website: website && website !== "" ? normalize(website, { forceHttps: true }) : "",
        skills: Array.isArray(skills) ? skills : skills.split(',').map((skill) => ' ' + skill.trim()),
        ...rest
    };

    const socialFields = { youtube, twitter, instagram, linkedin, facebook };

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
        if (value && value.length > 0)
        socialFields[key] = normalize(value, { forceHttps: true });
    }

    // add to profileFields
    profileFields.social = socialFields;

    try {
      // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate("user", ["name", "avatar"]);

        return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
}

//route:        GET api/profile/me
//desc:         get current user profile
//access:       private  
const getUserProfile = async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate("user", ["name", "avatar"]);

        if(!profile) {
            return res.status(400).json({ errors: [{ msg: "There is no profile for this user." }] });
        }

        res.json(profile)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ errors: [{ msg: "There was a  problem with the server, please try again." }] })
    }
}

//route:        GET api/profile
//desc:         get all users profile
//access:       public  
const getAllProfiles = async(req,res) => {
    try {
        const profiles = await Profile.find().populate("user", ["name", "avatar"]);
        
        if(!profiles) {
            return res.status(404).json({ errors: [{ msg: "No profiles found!" }] })
        }
    
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
}

//route:        GET api/profile/:id
//desc:         get current user profile
//access:       private  
const getUserProfileByID = async(req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate("user", ["name", "avatar"]);
    
        if(!profile) {
            return res.status(400).json({ errors: [{ msg: "No profile found!" }] });
        }
        
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind === "ObjectId") {
            return res.status(400).json({ errors: [{ msg: "No profile found!" }] });
        }
        res.status(500).send("server error");
    }
}

//route:        GET api/profile
//desc:         delete user profile
//access:       private  
const deleteUserProfile = async(req,res) => {
    try {
        //remove users posts

        //remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        //remove user
        await User.findOneAndRemove({_id: req.user.id});

        res.json({ msg: "user deleted!" })
    } catch (error) {
        console.error(error.message);
        if(error.kind === "ObjectId") {
            return res.status(400).json({ errors: [{ msg: "No profile found!" }] });
        }
        res.status(500).send("server error");
    }
}

//route:        GET api/profile/github/:username
//desc:         get user repos from github
//access:       public  
const getGithubRepo = async(req,res) => {
    const mainUrl = "https://api.github.com/users/";

    try {
        const uri = encodeURI(`${mainUrl}${req.params.username}/repos?per_page=5&sort=created:asc`);
            
        const headers = {
            "user-agent": "node.js",
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
        };
          
        const gitHubResponse = await axios.get(uri, { headers });

        return res.json(gitHubResponse.data);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("server error");
    }
}

module.exports = {
    getUserProfile, 
    createUserProfile, 
    getAllProfiles, 
    getUserProfileByID, 
    deleteUserProfile, 
    addProfileExperience, 
    deleteProfileExperience, 
    addProfileEducation, 
    deleteProfileEducation, 
    getGithubRepo };