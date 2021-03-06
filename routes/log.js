const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const authenticate = require('../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);

const User = require('../models/user');
const Match = require('../models/match');



//---------routes------------------------------------------------------

router.get('/', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    Match.find({ $or: [{ challenger: req.data._user._id }, { challenged: req.data._user._id }] })
        .sort({date: -1})
        .populate('challenged challenger game')
        .exec((err, matches) => {
            if (err) console.log(err);
            let matchResults = [];

            matches.forEach(m => {
                if (m.state == 2 || m.state == 3) {

                    let clng = {};
                    clng._id = m._id;
                    clng.gameName = m.game.name;
                    clng.challenger = {
                        _id: m.challenger._id,
                        full_name: m.challenger.full_name,
                        image: `../user/${m.challenger.folder}/${m.challenger.image}`,
                    }
                    clng.challenged = {
                        _id: m.challenged._id,
                        full_name: m.challenged.full_name,
                        image: `../user/${m.challenged.folder}/${m.challenged.image}`,
                    }
                    clng.date = m.date;
                    clng.balance = m.balance;
                    let isChallenger = '';
                    if (req.data._user._id.equals(m.challenger._id)) {
                        isChallenger = true;
                    }
                    clng.isChallenger = isChallenger ? 1 : 0;
                    clng.opponent = isChallenger ? clng.challenged : clng.challenger;
                    clng.result = '';
                    if (m.state == 2)
                        clng.result = isChallenger ? 'won' : 'lost';
                    if (m.state == 3)
                        clng.result = isChallenger ? 'lost' : 'won';

                        matchResults.push(clng);
                }

            });

            res.render('log', {
                pageTitle: 'match Log',
                proImg: profileImgPath,
                userName: req.data._user.full_name,
                balence: req.data._user.balance,
                user: req.data._user,
                matchResults : matchResults
            });
        });
});

//------------------------------------log events---------------------------------


router.get('/match/:id', (req, res) => {
    Match.findById(req.params.id)
    .populate('challenger challenged game')
    .exec((err, match)=> {
        if(err) console.log(err);
        if(match) {
            res.json({
                match : match,
                status : 'ok'
            });
        }
    });
});







module.exports = router;