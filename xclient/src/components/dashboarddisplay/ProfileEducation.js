import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { useDispatch } from "react-redux";
//import { deleteProfileEducation } from "../manager";
import SingleEducation from "./SingleEducation";

function ProfileEducation({ education: edu }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [education, setEducation] = useState([]);

    const dispatch = useDispatch();

    useEffect(() => {
        setLoading(true);
        if (edu) {
            setEducation(edu);
            setLoading(false);
        } else {
            setLoading(false);
            setError(true);
        }
    }, [edu]);

    if (loading) {
        return <h3>Loading...</h3>
    }

    if (error) {
        return <h3>Error...</h3>
    }

    function removeEdu(id) {
        const isConfirmed = window.confirm("You want to delete?");

        if (isConfirmed) {
            console.log("education deleted!");
            //dispatch(deleteProfileEducation(id));
        }
    }

    return (
        <Table className="table">
            <thead>
                <tr>
                    <td colSpan={4}>
                        <h2>Education</h2>
                    </td>
                </tr>
                <tr>
                    <th>School</th>
                    <th className="hide-sm">Level</th>
                    <th className="hide-sm">Years</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                {education
                    .sort((a, b) => {
                        const sortByFromDate = (Number(b.from.slice(0, 4))) - (Number(a.from.slice(0, 4)))
                        return sortByFromDate;
                    })
                    .map((item = { _id: "" }) => {
                        return <SingleEducation key={item._id} {...item} removeEdu={removeEdu} />
                    })
                }
                {education.length === 0 && (
                    <tr>
                        <td colSpan={4}>
                            N/A
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}

const Table = styled.table`
    min-width: 800px;

    span {
        color: grey;
        font-size: 0.6rem;
        display: block;
    }
`

export default ProfileEducation;
