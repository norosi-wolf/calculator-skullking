
// 
const SCENE_SETTING = "SCENE_SETTING";
const SCENE_GAME_PREDICT = "SCENE_GAME_PREDICT";
const SCENE_GAME_RESULT = "SCENE_GAME_RESULT";
const SCENE_RESULT = "SCENE_RESULT";
const ROUND_LAST = 10;
const LOCAL_STORAGE_KEY = "calculator-skullking";

// 
const GlobalValue =
{
    now_scene : SCENE_SETTING,
    round: 1,
    player_list: [],
};

// 
$(document).ready(function(){
    $('#setteing').hide();
    $('#game').hide();
    $('#result').hide();

    initialize();
});

// 
function initialize()
{
    // 初期化
    GlobalValue.player_list = [];
    GlobalValue.round = 1;

    // TODO: 途中データあれば読み込み
    load();

    $('#setteing').hide();
    $('#game').hide();
    $('#result').hide();
    switch(GlobalValue.now_scene)
    {
        case SCENE_SETTING:
            $('#setteing').show();
        break;
        case SCENE_GAME_PREDICT:
            $('#game').show();
            showGamePredict();
        break;
        case SCENE_GAME_RESULT :
            $('#game').show();
            showGameResult();
        break;
        case SCENE_RESULT:
            $('#setteing').show();
        break;
    }
}

// 
function onClickBtnRegistPlayer()
{
    createPlayers();
    GlobalValue.now_scene = SCENE_GAME_PREDICT;
    save();

    showGamePredict();
}

// 
function OnClickBtnSubmitPredict()
{
    for (let i = 0; i < GlobalValue.player_list.length; i++)
    {
        let elem_id = "#predict_" + GlobalValue.player_list[i].id;
        GlobalValue.player_list[i].predict = $(elem_id).val();
    }
    
    GlobalValue.now_scene = SCENE_GAME_RESULT;
    save();
    
    showGameResult();
}

//
function OnClickBtnSubmitResult()
{
    if (GlobalValue.round == ROUND_LAST)
    {
        // -> result
        $('#game').hide();
        $('#result').show();
        return;
    }

    GlobalValue.round++;

    addScores();
    GlobalValue.now_scene = SCENE_GAME_PREDICT;
    save();

    showGamePredict();
}

//
function onClickBtnRemove()
{
    destroy();
    $('#setteing').show();
    $('#result').hide();
    $('#game').hide();
}

//
function showGamePredict()
{
    updateScoreTable();
    updateRoundPredictTable();

    $('#game-round').text(getGameTitleText(GlobalValue.round));
    $('#setteing').hide();
    $('#game').show();
    
    $('#round-predict').show();
    $('#round-result').hide();
}

//
function showGameResult()
{
    updateScoreTable();
    updateRoundResultTable();

    $('#game-round').text(getGameTitleText(GlobalValue.round));
    $('#setteing').hide();
    $('#game').show();
    $('#round-predict').hide();
    $('#round-result').show();
}

// 
function createPlayers()
{
    let input_list = $('#regist-players').find('input');
    for (let i = 0; i < input_list.length; i++)
    {
        let name = $(input_list[i]).val();
        if (name == '') continue;

        let player = new Object();
        player.id = i + 1;
        player.name = name;
        player.scores = [];
        player.predict = 0;
        GlobalValue.player_list.push(player);
    }

    console.log(GlobalValue.player_list.length);
}

// 
function updateScoreTable()
{
    let html = '';
    for (let i = 0; i < GlobalValue.player_list.length; i++)
    {
        html += '<tr><td>' + GlobalValue.player_list[i].name + '</td>';

        let total_score = 0;
        for (let j = 0; j < GlobalValue.player_list[i].scores.length; j++)
        {
            html += '<td>' + GlobalValue.player_list[i].scores[j] + '</td>';
            total_score += GlobalValue.player_list[i].scores[j];
        }

        let rem = ROUND_LAST - GlobalValue.player_list[i].scores.length;
        for (let j = 0; j < rem; j++)
        {
            html += '<td></td>';
        }

        html += '<td>' + total_score + '</td>';
    }
    $('#score-table-body').html(html);
}

//
function updateRoundPredictTable()
{
    let html = '';
    for (let i = 0; i < GlobalValue.player_list.length; i++)
    {
        html += '<tr><td>' + GlobalValue.player_list[i].name + '</td>';
        
        html += '<td><select name="predict" id="predict_' + GlobalValue.player_list[i].id + '">';
        for (let j = 0; j < GlobalValue.round + 1; j++)
        {
            html += '<option value="' + j + '">' + j + '</option>';
        }
        html += '</select></td>';
    }
    $('#round-predict-table-body').html(html);
}

//
function updateRoundResultTable()
{
    let html = '';
    for (let i = 0; i < GlobalValue.player_list.length; i++)
    {
        html += '<tr><td>' + GlobalValue.player_list[i].name + '</td>';
        
        html += '<td>' + GlobalValue.player_list[i].predict + '</td>';

        html += '<td><select name="wins" id="wins_' + GlobalValue.player_list[i].id + '">';
        for (let j = 0; j < GlobalValue.round + 1; j++)
        {
            html += '<option value="' + j + '">' + j + '</option>';
        }
        html += '</select></td>';

        html += '<td id="bounus_' + GlobalValue.player_list[i].id + '">bounus</td>';
    }
    $('#round-result-table-body').html(html);
}

//
function addScores()
{
    for (let i = 0; i < GlobalValue.player_list.length; i++)
    {
        let elem_id = "#wins_" + GlobalValue.player_list[i].id;
        let wins = $(elem_id).val();
        let predict = GlobalValue.player_list[i].predict && GlobalValue.player_list[i].predict;

        let score = 0;

        // 通常スコア
        if (predict == wins)
        {
            if (predict == 0)   score += GlobalValue.round * 10;
            else                score += predict * 20;
        }
        else
        {
            if (predict == 0)   score -= GlobalValue.round * 10;
            else                score -= Math.abs(predict - wins) * 10;
        }
        
        // TODO: ボーナススコア

        
        GlobalValue.player_list[i].scores.push(score);
    }
}

// 
function getGameTitleText(round)
{
    return "Game: Round - " + round;
}

// 
function save()
{
    let json = JSON.stringify(GlobalValue);
    localStorage.setItem(LOCAL_STORAGE_KEY, json);
}
function load()
{
    let json = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (json == undefined || json == null || json == '')
    {
        return;
    }

    let obj = JSON.parse(json);
    GlobalValue.round = obj.round;
    GlobalValue.player_list = obj.player_list;
    GlobalValue.now_scene = obj.now_scene;
}
function destroy()
{
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}


