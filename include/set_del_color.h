// by naihe 05-8-14 7:05
string setcolor(string msg, int raw)
{
    mapping color_key;
    string *key, k;
    color_key = ([
        "$BLK$" : NOR+BLK,
        "$RED$" : NOR+RED,
        "$GRN$" : NOR+GRN,
        "$YEL$" : NOR+YEL,
        "$BLU$" : NOR+BLU,
        "$MAG$" : NOR+MAG,
        "$CYN$" : NOR+CYN,
        "$WHT$" : NOR+WHT,
        "$HIR$" : HIR,
        "$HIG$" : HIG,
        "$HIY$" : HIY,
        "$HIB$" : HIB,
        "$HIM$" : HIM,
        "$HIC$" : HIC,
        "$HIW$" : HIW,
        "$NOR$" : NOR,
    ]);
    if( raw == 1 )
    {
        color_key += ([
            "$HBRED$" : HBRED,
            "$HBGRN$" : HBGRN,
            "$HBYEL$" : HBYEL,
            "$HBBLU$" : HBBLU,
            "$HBMAG$" : HBMAG,
            "$HBCYN$" : HBCYN,
            "$HBWHT$" : HBWHT,
            "$BBLK$" : BBLK,
            "$BRED$" : BRED,
            "$BGRN$" : BGRN,
            "$BYEL$" : BYEL,
            "$BBLU$" : BBLU,
            "$BMAG$" : BMAG,
            "$BCYN$" : BCYN,
            "$SPARK$" : BLINK,
            "$BLINK$" : BLINK,
        ]);
    }
    else if (raw == 2)
    {
        color_key += ([
            "$BOLD$" : BOLD,
            "$CLR$" : CLR,
            "$HOME$" : HOME,
            "$REF$" : REF,
            "$BIGTOP$" : BIGTOP,
            "$BIGBOT$" : BIGBOT,
            "$SAVEC$" : SAVEC,
            "$REST$" : REST,
            "$SINGW$" : SINGW,
            "$DBL$" : DBL,
            "$FRTOP$" : FRTOP,
            "$FRBOT$" : FRBOT,
            "$UNFR$" : UNFR,
            "$U$" : U,
            "$REV$" : REV,
            "$HIREV$" : HIREV,
        ]);
    }
    key = keys( color_key );
    foreach( k in key )
    {
        msg = replace_string( msg, k, color_key[k] );
    }
    return msg+NOR;
}

string delcolor(string msg)
{
    string *color_key;
    color_key = ({
        BLK, RED, GRN, YEL, BLU, MAG, CYN, WHT,
        NOR, HIR, HIG, HIY, HIB, HIM, HIC, HIW,
        HBRED, HBGRN, HBYEL, HBBLU, HBMAG, HBCYN, HBWHT,
        BBLK, BRED, BGRN, BYEL, BBLU, BMAG, BCYN, BLINK,
    });
    /*
    color_key += ({
        BOLD, CLR, HOME, REF, BIGTOP, BIGBOT, SAVEC, REST,
        SINGW, DBL, FRTOP, FRBOT, UNFR, U, REV, HIREV,
    })
    */
    // discard by Karlopex@sz
    return msg;
}



