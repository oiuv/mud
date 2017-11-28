#include <ansi.h>
#define che TABLE[table[sROW]][sCOL][2]
#define cc TABLE[table[sROW]][sCOL][3]
#define cc1 TABLE[table[tROW]][tCOL][3]
inherit ITEM;
inherit F_SAVE;

string bche = "";
string rche = "";
string aaa = "";
int aa = 0;
int bb = 0;

mapping TABLE = ([ // table /*┌┐┖┚─┃├┤┬┴┼*/
0: ([
        0 :({ "┌",HIR"车"NOR, 1,1 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┬",HIR"马"NOR, 2,1 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┬",HIR"相"NOR, 3,1 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┬",HIR"仕"NOR, 4,1 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┬",HIR"帅"NOR, 5,1 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┬",HIR"仕"NOR, 4,1 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┬",HIR"相"NOR, 3,1 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┬",HIR"马"NOR, 2,1 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┐",HIR"车"NOR, 1,1 }),
        ]),
1: ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
        5 : ({ "  ", "  ", 0,0 }),
        6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "＼", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "／", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
        11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
        13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),

2: ([
        0 :({ "├", "  ", 0,0 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┼", "  ", 0,0 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┼", "  ", 0,0 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┼", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┼", "  ", 0,0 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┼", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┼", "  ", 0,0 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┼", "  ", 0,0 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┤", "  ", 0,0 }),
        ]),
3: ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
        5 : ({ "  ", "  ", 0,0 }),
        6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "／", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "＼", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
        11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
        13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),
4 : ([
        0 :({ "├", "  ", 0,0 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┼",HIR"炮"NOR, 6,1 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┼", "  ", 0,0 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┼", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┼", "  ", 0,0 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┼", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┼", "  ", 0,0 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┼",HIR"炮"NOR, 6,1 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┤", "  ", 0,0 }),
        ]),
5 : ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
        5 : ({ "  ", "  ", 0,0 }),
        6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "  ", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "  ", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
        13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),
6 : ([
        0 :({ "├",HIR"兵"NOR, 7,1 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┼", "  ", 0,0 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┼",HIR"兵"NOR, 7,1 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┼", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┼",HIR"兵"NOR, 7,1 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┼", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┼",HIR"兵"NOR, 7,1 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┼", "  ", 0,0 }),
15:({ "─", "  ", 0,0 }),
        16:({ "┤",HIR"兵"NOR, 7,1 }),
        ]),
7 : ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
        5 : ({ "  ", "  ", 0,0 }),
        6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "  ", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "  ", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
        11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
        13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),
8 : ([
0 :({ "┖", "  ", 0,0 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┴", "  ", 0,0 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┴", "  ", 0,0 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┴", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┴", "  ", 0,0 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┴", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┴", "  ", 0,0 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┴", "  ", 0,0 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┚", "  ", 0,0 }),
        ]),
9 : ([
        0 : ({ " ～～ 楚  河 ～～～～ 汉  界 ～～ ", "  ", 0,0 }),
        ]),
10: ([
        0 :({ "┌", "  ", 0,0 }),
1 :({ "─", "  ", 0,0 }),
        2 :({ "┬", "  ", 0,0 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┬", "  ", 0,0 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┬", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┬", "  ", 0,0 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┬", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┬", "  ", 0,0 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┬", "  ", 0,0 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┐", "  ", 0,0 }),
        ]),
11: ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
5 : ({ "  ", "  ", 0,0 }),
        6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "  ", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "  ", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
        11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
        13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),
12 : ([
        0 :({ "├",HIC"卒"NOR, 7,2 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┼", "  ", 0,0 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┼",HIC"卒"NOR, 7,2 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┼", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┼",HIC"卒"NOR, 7,2 }),
9 :({ "─", "  ", 0,0 }),
        10:({ "┼", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┼",HIC"卒"NOR, 7,2 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┼", "  ", 0,0 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┤",HIC"卒"NOR, 7,2 }),
        ]),
13: ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
        5 : ({ "  ", "  ", 0,0 }),
        6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "  ", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "  ", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
        11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),
14: ([
        0 :({ "├", "  ", 0,0 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┼",HIC"砲"NOR, 6,2 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┼", "  ", 0,0 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┼", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┼", "  ", 0,0 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┼", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┼", "  ", 0,0 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┼",HIC"砲"NOR, 6,2 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┤", "  ", 0,0 })
]),
15: ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
        5 : ({ "  ", "  ", 0,0 }),
        6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "＼", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "／", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
        11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
        13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),
16: ([
        0 :({ "├", "  ", 0,0 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┼", "  ", 0,0 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┼", "  ", 0,0 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┼", "  ", 0,0 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┼", "  ", 0,0 }),
        9 :({ "─", "  ", 0,0 }),
        10:({ "┼", "  ", 0,0 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┼", "  ", 0,0 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┼", "  ", 0,0 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┤", "  ", 0,0 })
        ]),
18: ([
        0 : ({ "┃", "  ", 0,0 }),
        1 : ({ "  ", "  ", 0,0 }),
        2 : ({ "┃", "  ", 0,0 }),
        3 : ({ "  ", "  ", 0,0 }),
        4 : ({ "┃", "  ", 0,0 }),
        5 : ({ "  ", "  ", 0,0 }),
6 : ({ "┃", "  ", 0,0 }),
        7 : ({ "／", "  ", 0,0 }),
        8 : ({ "┃", "  ", 0,0 }),
        9 : ({ "＼", "  ", 0,0 }),
        10: ({ "┃", "  ", 0,0 }),
        11: ({ "  ", "  ", 0,0 }),
        12: ({ "┃", "  ", 0,0 }),
        13: ({ "  ", "  ", 0,0 }),
        14: ({ "┃", "  ", 0,0 }),
        15: ({ "  ", "  ", 0,0 }),
        16: ({ "┃", "  ", 0,0 })
        ]),
19: ([
        0 :({ "┖",HIC"車"NOR, 1,2 }),
        1 :({ "─", "  ", 0,0 }),
        2 :({ "┴",HIC"馬"NOR, 2,2 }),
        3 :({ "─", "  ", 0,0 }),
        4 :({ "┴",HIC"象"NOR, 3,2 }),
        5 :({ "─", "  ", 0,0 }),
        6 :({ "┴",HIC"士"NOR, 4,2 }),
        7 :({ "─", "  ", 0,0 }),
        8 :({ "┴",HIC"將"NOR, 5,2 }),
        9 :({ "─", "  ", 0,0 }),
10:({ "┴",HIC"士"NOR, 4,2 }),
        11:({ "─", "  ", 0,0 }),
        12:({ "┴",HIC"象"NOR, 3,2 }),
        13:({ "─", "  ", 0,0 }),
        14:({ "┴",HIC"馬"NOR, 2,2 }),
        15:({ "─", "  ", 0,0 }),
        16:({ "┚",HIC"車"NOR, 1,2 }),
        ]),

]);

string *table;

string *tossText = ({

        "│      │\n"
        "│  "HIR"●"NOR"  │\n"
        "│      │\n",

        "│  ●  │\n"
        "│      │\n"
        "│  ●  │\n",

"│●    │\n"
        "│  ●  │\n"
        "│    ●│\n",

        "│"HIR"●  ●"NOR"│\n"
        "│      │\n"
        "│"HIR"●  ●"NOR"│\n",

        "│●  ●│\n"
        "│  ●  │\n"
        "│●  ●│\n",

        "│●  ●│\n"
        "│●  ●│\n"
        "│●  ●│\n",

        "┏━━━┐\n",
        "┖━━━┛\n",
});


int init_tab();
int do_display(string arg);
int do_move(string arg);
int do_toss();
string long();
string query_save_file();
void do_check();
int do_save();
int do_deploy();

void create()
{
        set_name("中国象棋盘", ({ "chinese chess board","ccb" }) );
        set_weight(3000000);
        set_max_encumbrance(0);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", "这是一张中国象棋盘，用来下象棋的。\n");
                set("value", 0);
                set("material", "wood");
                set("no_get",1);
                set("no_drop",1);
        }
        setup();
}
void init() {
init_tab();
        add_action("do_move","move");   
        add_action("do_toss","toss");
        add_action("do_reset","reset");
        add_action("do_save","csave");
        add_action("do_deploy","deploy");
        add_action("do_lose","lose");
        add_action("do_help","help");
        add_action("do_review","review");
}

string query_save_file()
{ 
if( bb == 1 )
return DATA_DIR + "cchess/" 
+ this_player()->query("id")[0..0] 
+ "/" + this_player()->query("id"); 
else
return DATA_DIR + "cchess/cchess"; 
}

int init_tab() {
        table = keys(TABLE);
        table = sort_array(table,1);
        return 1;
}

int do_move(string arg) {
        int sROW,sCOL,tROW,tCOL,i,ii,x,y,tem,tem1,tem2,tem3,tem4;
        string msg,msg1;
object ob,me; 
ob = this_object();
me = this_player();
msg1 = "";

if( ob->query("over") ) return notify_fail("这盘棋已经结束了。 \n");

if( me->name() != ob->query("name1") && me->name() != ob->query("name2") )
return notify_fail("你还是先投骰子吧！\n");

if( !ob->query("name2") )
return notify_fail("还要有一个人才能下棋！\n");

if( ob->query("round") == 0 && ob->query("first") != me->name() )
return notify_fail("这个回合不该你走棋！\n");

if( ob->query("round") == 1 && ob->query("first") == me->name() )
return notify_fail("这个回合不该你走棋！\n");

        if( !arg ) return notify_fail("移动棋子：move 横坐标 纵坐标 to 横坐标 纵坐标 \n");

        if( sscanf(arg,"%d %d to %d %d",sCOL,sROW,tCOL,tROW) != 4 )
                return notify_fail("移动棋子：move 横坐标 纵坐标 to 横坐标 纵坐标 \n");

if( tCOL > 9 || tCOL < 1 || tROW > 9 || tROW < 0 ||
sCOL > 9 || sCOL < 1 || sROW > 9 || sROW < 0)
                return notify_fail("你的输入已经超越象棋盘界线了。\n");

if( tCOL == sCOL && sROW == tROW )
return notify_fail("这还用移动吗？\n");

        sCOL -= 1;
        tCOL -= 1;

        sROW = sROW * 2;
        tROW = tROW * 2;
        sCOL = sCOL * 2;
        tCOL = tCOL * 2;

        if( TABLE[table[sROW]][sCOL][1] == "  " )
return notify_fail("这个地方没有棋子。\n");

if( TABLE[table[tROW]][tCOL][3] == TABLE[table[sROW]][sCOL][3] )
return notify_fail("你要吃掉自己的棋子？\n");

if( ob->query("round") == 0 && cc != 1 )
                return notify_fail("你拿错棋子了吧！\n");

if( ob->query("round") == 1 && cc != 2 )
                return notify_fail("你拿错棋子了吧！\n");


//车 
if( che == 1 ){
if( tCOL != sCOL && sROW != tROW )
return notify_fail("这个棋子只能走直线。\n");

if( tCOL > sCOL && tCOL - sCOL > 2 )
for (i=sCOL+2;i<tCOL;i++){
if( i%2!=0) continue;
if( TABLE[table[sROW]][i][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( sCOL > tCOL && sCOL - tCOL > 2 )
for (i=tCOL+2;i<sCOL;i++){
if( i%2!=0) continue;
if( TABLE[table[sROW]][i][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( tROW > sROW && tROW - sROW > 2  )
for (i=sROW+2;i<tROW;i++){
if( i%2!=0) continue;
if( TABLE[table[i]][sCOL][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( sROW > tROW && sROW - tROW > 2 )
for (i=tROW+2;i<sROW;i++){
if( i%2!=0) continue;
if( TABLE[table[i]][sCOL][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
}

//马
if( che == 2 ){
if( tCOL == sCOL || sROW == tROW )
return notify_fail("马不能走直线。\n");

if( tCOL < (sCOL - 4) || tCOL > (sCOL + 4) ||
tROW < (sROW - 4) || tROW > (sROW + 4 ) )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( (tCOL == sCOL - 2 || tCOL == sCOL + 2) && 
(tROW != sROW - 4 && tROW != sROW + 4) )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( (tCOL == sCOL - 4 || tCOL == sCOL + 4) && 
(tROW != sROW - 2 && tROW != sROW + 2) )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( sCOL-tCOL < -2 && TABLE[table[sROW]][sCOL+2][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( sCOL-tCOL > 2 && TABLE[table[sROW]][sCOL-2][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( sROW-tROW > 2 && TABLE[table[sROW-2]][sCOL][1] != "  "  )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( sROW-tROW < -2 && TABLE[table[sROW+2]][sCOL][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
//相
if( che == 3 ){
if( tCOL == sCOL || sROW == tROW )
return notify_fail("相不能走直线。\n");

if( (tROW != sROW-4 && tROW != sROW+4) || (tCOL != sCOL-4 
&& tCOL != sCOL+4) )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( tCOL > sCOL ){
if( tROW > sROW && TABLE[table[sROW+2]][sCOL+2][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( tROW < sROW && TABLE[table[sROW-2]][sCOL+2][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( tCOL < sCOL ){
if( tROW > sROW && TABLE[table[sROW+2]][sCOL-2][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( tROW < sROW && TABLE[table[sROW-2]][sCOL-2][1] != "  " )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( (cc == 1 && tROW > 9) || (cc == 2 && tROW < 9) )
return notify_fail("相不能过河。\n");
}
//仕
if( che == 4 ){

if( tCOL == sCOL || sROW == tROW )
return notify_fail("仕不能走直线。\n");

if( (tROW != sROW-2 && tROW != sROW+2) || (tCOL != sCOL-2 
&& tCOL != sCOL+2) )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( cc == 1 && (tCOL > 10 || tCOL < 6 || tROW > 4) )
return notify_fail("那个位置超出仕移动的范围了。\n");

if( cc == 2 && (tCOL > 10 || tCOL < 6 || tROW < 14) )
return notify_fail("那个位置超出仕移动的范围了。\n");
}
//帅
if( che == 5 ){
if( tCOL != sCOL && sROW != tROW )
return notify_fail("这个棋子只能走直线。\n");

if( tCOL - sCOL > 2 || tCOL - sCOL < -2 ||
tROW - sROW > 2 || tROW - sROW < -2 )
return notify_fail("帅一次只能走一格。\n");

if( cc == 1 )
if( tCOL > 10 || tCOL < 6 || tROW > 4 )
return notify_fail("那个位置超出帅移动的范围了。\n");

if( cc == 2 )
if( tCOL > 10 || tCOL < 6 || tROW < 14 )
return notify_fail("那个位置超出帅移动的范围了。\n");
}
//炮
if( che == 6 ){
ii = 0;

if( tCOL != sCOL && sROW != tROW )
return notify_fail("这个棋子只能走直线。\n");


if( cc1 != 0 )
if( tCOL - sCOL == 2 || tCOL - sCOL == -2 ||
tROW - sROW == 2 || tROW - sROW == -2 )
return notify_fail("这个棋子不能移动到那个地方。\n");

if( tCOL > sCOL ){
for (i=sCOL+2;i<tCOL;i++){
if( i%2!=0) continue;
if( TABLE[table[sROW]][i][1] != "  " )
ii += 1;
if( ii > 1 )
return notify_fail("这个棋子不能移动到那个地方。\n");
if( ii == 1 && cc1 == 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
if( ii == 0 && cc1 != 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( sCOL > tCOL ){
for (i=tCOL+2;i<sCOL;i++){
if( i%2!=0) continue;
if( TABLE[table[sROW]][i][1] != "  " )
ii += 1;
if( ii > 1 )
return notify_fail("这个棋子不能移动到那个地方。\n");
if( ii == 1 && cc1 == 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
if( ii == 0 && cc1 != 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( tROW > sROW && tROW - sROW > 2  ){
for (i=sROW+2;i<tROW;i++){
if( i%2!=0) continue;
if( TABLE[table[i]][sCOL][1] != "  " )
ii += 1;
if( ii > 1 )
return notify_fail("这个棋子不能移动到那个地方。\n");
if( ii == 1 && cc1 == 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
if( ii == 0 && cc1 != 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}

if( sROW > tROW && sROW - tROW > 2 ){
for (i=tROW+2;i<sROW;i++){
if( i%2!=0) continue;
if( TABLE[table[i]][sCOL][1] != "  " )
ii += 1;
if( ii > 1 )
return notify_fail("这个棋子不能移动到那个地方。\n");
if( ii == 1 && cc1 == 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
if( ii == 0 && cc1 != 0 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
}

//兵
if( che == 7 ){
if( tCOL - sCOL > 2 || tCOL - sCOL < -2 ||
tROW - sROW > 2 || tROW - sROW < -2 )
return notify_fail("兵一次只能走一格。\n");
if( tCOL != sCOL && sROW != tROW )
return notify_fail("这个棋子只能走直线。\n");
if( cc == 1 ){
if( sROW > tROW ) return notify_fail("兵不能往回走。\n");
if( tCOL != sCOL && sROW < 9 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
if( cc == 2 ){
if( sROW < tROW ) return notify_fail("兵不能往回走。\n");
if( tCOL != sCOL && sROW > 9 )
return notify_fail("这个棋子不能移动到那个地方。\n");
}
}

if ( TABLE[table[tROW]][tCOL][2] != 0 ){
msg1 += "$N吃掉了对手一个" + sprintf("%s。\n",TABLE[table[tROW]][tCOL][1]);
if( cc1 == 1 )
bche+=TABLE[table[tROW]][tCOL][1];
else
rche+=TABLE[table[tROW]][tCOL][1];
}

if ( TABLE[table[tROW]][tCOL][2] == 5 ){
msg1 += HIY"$N赢得了这场比赛的胜利。\n"NOR;
ob->set("over",this_player()->name());
}

        TABLE[table[tROW]][tCOL][1] = TABLE[table[sROW]][sCOL][1];
TABLE[table[tROW]][tCOL][2] = TABLE[table[sROW]][sCOL][2];
TABLE[table[tROW]][tCOL][3] = TABLE[table[sROW]][sCOL][3];
        TABLE[table[sROW]][sCOL][1] = "  ";
TABLE[table[sROW]][sCOL][2] = 0; 
TABLE[table[sROW]][sCOL][3] = 0; 

tem4 = 0;
        for( y=0;y<6;y++ ){
if( y%2 != 0 ) continue;
                for( x=6;x<12;x++ ) {
if( x%2 != 0 ) continue;
                        if( TABLE[table[y]][x][2] == 5 ){
tem = x;
tem3 = y;
break;
                }
}
}

        for( y=14;y<19;y++ ){
if( y%2 != 0 ) continue;
                for( x=6;x<12;x++ ) {
if( x%2 != 0 ) continue;
                        if( TABLE[table[y]][x][2] == 5 ){
tem1 = x;
tem2 = y;
break;
}
                }
}

if( tem == tem1 ){
for (i=tem3+2;i<tem2;i++){
if( i%2!=0) continue;
if( TABLE[table[i]][tem][1] != "  " )
tem4 = 1; 
}
if( tem4 == 0 ){
        msg1 += (sprintf(HIY"%s赢得了这场比赛的胜利。\n"NOR,
ob->query("name1") == me->name()?ob->query("name2"):
ob->query("name1")) ); 
ob->set("over", ob->query("name1") == me->name()?ob->query("name2"):
ob->query("name1") );
}
}

        if( sROW == tROW )
if( cc1 == 2 )
                msg = sprintf("『%s』%s平%s",
                                        TABLE[table[tROW]][tCOL][1],
                                        chinese_number(sCOL/2+1),
                                        chinese_number(tCOL/2+1) );
else
                msg = sprintf("『%s』%s平%s",
                                        TABLE[table[tROW]][tCOL][1],
                                        chinese_number(10-(sCOL/2+1)),
                                        chinese_number(10-(tCOL/2+1)) );

        else 
if( cc1 == 2 )
                if( sROW>tROW )
                        msg = sprintf("『%s』%s进%s",
TABLE[table[tROW]][tCOL][1],
                                                chinese_number(sCOL/2+1),
                                                sCOL==tCOL?chinese_number( (sROW-tROW)/2 ):chinese_number(tCOL/2+1) );
                else
                        msg = sprintf("『%s』%s退%s",
                                                TABLE[table[tROW]][tCOL][1],
                                                chinese_number(sCOL/2+1),
                                                sCOL==tCOL?chinese_number( (tROW-sROW)/2 ):chinese_number(tCOL/2+1) );

else 
                if( tROW>sROW )
                        msg = sprintf("『%s』%s进%s",
TABLE[table[tROW]][tCOL][1],
chinese_number(10-(sCOL/2+1)),
                                                sCOL==tCOL?chinese_number( (tROW-sROW)/2 ):chinese_number(10-(tCOL/2+1)) );
                else
                        msg = sprintf("『%s』%s退%s",
                                                TABLE[table[tROW]][tCOL][1],
chinese_number(10-(sCOL/2+1)),
                                                sCOL==tCOL?chinese_number( (sROW-tROW)/2 ):chinese_number(10-(tCOL/2+1)) );

        message_vision( "$N下了一着"+msg+"\n",this_player());
        message_vision( msg1,me);

do_check();

if( aa == 4 ){
aaa += msg+"\n"; 
aa = 0;
} else {
aaa += msg+" ";
aa += 1;
}


ob->query("round") == 1?ob->set("round",0):ob->set("round",1);
return 1;
}

int do_toss() {
        int num;
        string text;
object me, ob;
me = this_player();
ob = this_object();

if( ob->query("name2") )
return notify_fail("已经有两个人在下棋了。\n");

if( me->name() == ob->query("name1") )
return notify_fail("你已经投过一次骰子了。\n");

        num = random(6);

if( ob->query("num") == num )
        num = random(6);

        text = "拿起骰子在手中摇了两摇, 掷出了一个：\n";
        text += tossText[6]+tossText[num]+tossText[7];
        message_vision( "$N"+text,me );

if( ob->query("name1") ){
ob->query("num")>num?ob->set("first",ob->query("name1"))
:ob->set("first",me->name());
        message_vision( ob->query("first")+"使用红色棋子先行。\n",me );
}

ob->set("num",num);
ob->query("name1")?ob->set("name2",me->name()): ob->set("name1",me->name());
ob->query("id1")?ob->set("id2",me->query("id")):ob->set("id1",me->query("id"));

        return 1;
}

string long() {
        int row,col,i;
        string text,round,msg;
object ob,me;
ob = this_object();
me = this_player();
        text = "\n1   2   3   4   5   6   7   8   9\n";
msg = ob->query("name1")==ob->query("first")?ob->query("name2"):ob->query("name1");

if( ob->query("name2") ){
if( ob->query("over") )
round = " 这盘棋"+ob->query("over")+"赢了。";
else
if( ob->query("round") == 1 )
round = " 现在轮到"+HIC"蓝子"NOR+"下";
else
round = " 现在轮到"+HIR"红子"NOR+"下";
TABLE[table[9]][0][1] = sprintf("%s%s",TABLE[table[9]][0][0],round );
}

if( me->name() != ob->query("first") ){
TABLE[table[17]][0][1] = "┃";
TABLE[table[3]][0][1] = "┃";
TABLE[table[5]][0][1] = "┃";
TABLE[table[13]][0][1] = "┃";
TABLE[table[15]][0][1] = "┃";
TABLE[table[0]][0][0] = "┌";
TABLE[table[10]][0][0] = "┌";
TABLE[table[0]][16][0] = "┐";
TABLE[table[10]][16][0] = "┐";
TABLE[table[18]][16][0] = "┘";
TABLE[table[8]][16][0] = "┘";
TABLE[table[8]][0][0] = "└";
TABLE[table[18]][0][0] = "└";
TABLE[table[2]][16][0] = TABLE[table[4]][16][0]
= TABLE[table[6]][16][0] = TABLE[table[12]][16][0]
= TABLE[table[14]][16][0] = TABLE[table[16]][16][0]
= "┤";
TABLE[table[2]][0][0] = TABLE[table[4]][0][0]
= TABLE[table[6]][0][0] = TABLE[table[12]][0][0]
= TABLE[table[14]][0][0] = TABLE[table[16]][0][0]
= "├";

TABLE[table[1]][16][1] = "┃ 如有问题，请参看“help cchess”";
TABLE[table[15]][16][1] = sprintf("%s%s%s",TABLE[table[15]][16][0]," ",bche );
TABLE[table[5]][16][1] = sprintf("%s%s%s",TABLE[table[5]][16][0]," ",rche );

if( ob->query("name2") ){
TABLE[table[3]][16][1] = sprintf("%s%s%s","┃"," ("+ob->query("first")+") ",HIR"红方"NOR+"所吃棋子：" );
TABLE[table[13]][16][1] = sprintf("%s%s%s","┃"," ("+msg+") ",HIC"蓝方"NOR+"所吃棋子：" );
}

for( i=2;i<16;i++){
if( i%2!=0) continue;
TABLE[table[8]][i][0] = "┴";
TABLE[table[10]][i][0] = "┬";
TABLE[table[18]][i][0] = "┴";
TABLE[table[0]][i][0] = "┬";
}

        for( row=0; row<sizeof(table); row++ ) {
                for( col=0; col<sizeof(TABLE[table[row]]); col++ ) {
                        if( TABLE[table[row]][col][1] == "  " )
                                text += sprintf("%s", TABLE[table[row]][col][0] );
                        else
                                text += sprintf("%s", TABLE[table[row]][col][1] );
                }
                if( row%2 == 0)
                        text += sprintf(" %d", row/2 );
                text += "\n";
        }
} else {
        text = "\n9   8   7   6   5   4   3   2   1\n";
TABLE[table[1]][16][1] = "┃";
TABLE[table[3]][16][1] = "┃";
TABLE[table[5]][16][1] = "┃";
TABLE[table[13]][16][1] = "┃";
TABLE[table[15]][16][1] = "┃";
TABLE[table[0]][0][0] = "┘";
TABLE[table[18]][16][0]= "┌";
TABLE[table[0]][16][0] = "└";
TABLE[table[18]][0][0] = "┐";
TABLE[table[8]][16][0] = "┌";
TABLE[table[10]][16][0] = "└";
TABLE[table[2]][16][0] = TABLE[table[4]][16][0]
= TABLE[table[6]][16][0] = TABLE[table[12]][16][0]
= TABLE[table[14]][16][0] = TABLE[table[16]][16][0]
= "├";
TABLE[table[10]][0][0] = "┚";
TABLE[table[8]][0][0] = "┐";
TABLE[table[2]][0][0] = TABLE[table[4]][0][0]
= TABLE[table[6]][0][0] = TABLE[table[12]][0][0]
= TABLE[table[14]][0][0] = TABLE[table[16]][0][0]
= "┤";

TABLE[table[17]][0][1] = "┃ 如有问题，请参看“help cchess”";
TABLE[table[13]][0][1] = sprintf("%s%s%s",TABLE[table[15]][16][0]," ",bche );
TABLE[table[3]][0][1] = sprintf("%s%s%s",TABLE[table[5]][16][0]," ",rche );

if( ob->query("name2") ){
TABLE[table[5]][0][1] = sprintf("%s%s%s","┃"," ("+ob->query("first")+") ",HIR"红方"NOR+"所吃棋子：" );
TABLE[table[15]][0][1] = sprintf("%s%s%s","┃"," ("+msg+") ",HIC"蓝方"NOR+"所吃棋子：" );
}

for( i=2;i<16;i++){
if( i%2!=0) continue;
TABLE[table[8]][i][0] = "┬";
TABLE[table[10]][i][0] = "┴";
TABLE[table[18]][i][0] = "┬";
TABLE[table[0]][i][0] = "┴";
}

        for( row=(sizeof(table)-1); row>-1; row-- ) {
                for( col=(sizeof(TABLE[table[row]])-1); col>-1; col-- ) {
                        if( TABLE[table[row]][col][1] == "  " )
                                text += sprintf("%s", TABLE[table[row]][col][0] );
                        else
                                text += sprintf("%s", TABLE[table[row]][col][1] );
                }
                if( row%2 == 0)
                        text += sprintf(" %d", row/2 );
                text += "\n";
        }
}
        return text;
}
void do_check(){
int x,y,tem,tem1,i,tem3,check;
object ob = this_object();
check = 0;

if( ob->query("over") ) return;

if( ob->query("round") == 1 )
        for( y=0;y<5;y++ ){
if( y%2 != 0 ) continue;
                for( x=6;x<11;x++ ) {
if( x%2 != 0 ) continue;
                        if( TABLE[table[y]][x][2] == 5 ){
tem = x;
tem1 = y;
break;
                }
}
}
else
        for( y=14;y<19;y++ ){
if( y%2 != 0 ) continue;
                for( x=6;x<11;x++ ) {
if( x%2 != 0 ) continue;
                        if( TABLE[table[y]][x][2] == 5 ){
tem = x;
tem1 = y;
break;
}
                }
}

if( tem1 < 9 )
if( TABLE[table[tem1+2]][tem][2] == 7 &&
TABLE[table[tem1+2]][tem][3] != TABLE[table[tem1]][tem][3] )
check = 1;

if( tem1 > 9 )
if( TABLE[table[tem1-2]][tem][2] == 7 && 
TABLE[table[tem1-2]][tem][3] != TABLE[table[tem1]][tem][3] )
check = 1;

if( TABLE[table[tem1]][tem+2][2] == 7 )
check = 1;

if( TABLE[table[tem1]][tem-2][2] == 7 )
check = 1;


tem3 = 0;
for (i=tem+2;i<17;i++){
if( i%2!=0) continue;
if( tem3 == 1 && TABLE[table[tem1]][i][2] == 6 )
if( TABLE[table[tem1]][i][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if( TABLE[table[tem1]][i][2] == 1 && tem3 == 0 )
if( TABLE[table[tem1]][i][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if(  TABLE[table[tem1]][i][2] != 0 )
tem3 += 1;
}

tem3 = 0;
for (i=tem-2;i>-1;i--){
if( i%2!=0) continue;
if( tem3 == 1 && TABLE[table[tem1]][i][2] == 6 )
if( TABLE[table[tem1]][i][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if( TABLE[table[tem1]][i][2] == 1 && tem3 == 0 )
if( TABLE[table[tem1]][i][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if(  TABLE[table[tem1]][i][2] != 0 )
tem3 += 1;
}

tem3 = 0;
for (i=tem1-2;i>-1;i--){
if( i%2!=0) continue;
if( tem3 == 1 && TABLE[table[i]][tem][2] == 6 )
if( TABLE[table[i]][tem][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if( TABLE[table[i]][tem][2] == 1 && tem3 == 0 )
if( TABLE[table[i]][tem][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if(  TABLE[table[i]][tem][2] != 0 )
tem3 += 1;
}

tem3 = 0;
for (i=tem1+2;i<19;i++){
if( i%2!=0) continue;
if( tem3 == 1 && TABLE[table[i]][tem][2] == 6 )
if( TABLE[table[i]][tem][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if( TABLE[table[i]][tem][2] == 1 && tem3 == 0 )
if( TABLE[table[i]][tem][3] != TABLE[table[tem1]][tem][3] ){
check = 1;
break;
}
if(  TABLE[table[i]][tem][2] != 0 )
tem3 += 1;
}

if( tem1 > 1 ){
if( TABLE[table[tem1-2]][tem-2][2] == 0 ){
if( tem1 > 2 )
if( TABLE[table[tem1-4]][tem-2][2] == 2 && 
TABLE[table[tem1-4]][tem-2][3] != TABLE[table[tem1]][tem][3] )
check = 1;

if( TABLE[table[tem1-2]][tem-4][2] == 2 && TABLE[table[tem1-2]][tem-4][3] != 
TABLE[table[tem1]][tem][3] )
check = 1;
}

if( TABLE[table[tem1-2]][tem+2][2] == 0 ){
if( tem1 > 2 )
if( TABLE[table[tem1-4]][tem+2][2] == 2 && 
TABLE[table[tem1-4]][tem+2][3] != TABLE[table[tem1]][tem][3] )
check = 1;

if( TABLE[table[tem1-2]][tem+4][2] == 2 && TABLE[table[tem1-2]][tem+4][3] != 
TABLE[table[tem1]][tem][3] )
check = 1;
}
}

if( tem1 < 17 ){
if( TABLE[table[tem1+2]][tem-2][2] == 0 ){
if( tem1 < 16 )
if( TABLE[table[tem1+4]][tem-2][2] == 2 && 
TABLE[table[tem1+4]][tem-2][3] != TABLE[table[tem1]][tem][3] )
check = 1;

if( TABLE[table[tem1+2]][tem-4][2] == 2 && TABLE[table[tem1+2]][tem-4][3] != 
TABLE[table[tem1]][tem][3] )
check = 1;
}

if( TABLE[table[tem1+2]][tem+2][2] == 0 ){
if( tem1 < 16 )
if( TABLE[table[tem1+4]][tem+2][2] == 2 && 
TABLE[table[tem1+4]][tem+2][3] != TABLE[table[tem1]][tem][3] )
check = 1;

if( TABLE[table[tem1+2]][tem+4][2] == 2 && TABLE[table[tem1+2]][tem+4][3] != 
TABLE[table[tem1]][tem][3] )
check = 1;
}
}

if( check ) message_vision("$N说道"+HIG"“将军！！”\n"NOR,this_player() );
}

int do_save()
{
bb = 1;
save();
write("记录完毕\n");
return 1;
}

int do_deploy()
{
object me,ob;
me = this_player();
ob = this_object();
bb = 1; 

if( ob->query("id1") )
if( (present(ob->query("id1"),environment(ob))) || 
(present(ob->query("id2"),environment(ob))) )
if( me->name() != ob->query("name1") && me->name() != ob->query("name2") && !ob->query("over") )
return notify_fail("比赛还在进行中，你不能乱动棋盘！\n"); 

if( !restore() ) return notify_fail("你目前没有纪录的残局。\n");

setup();
write("OK！\n");
return 1;
}

int do_lose()
{
object ob,me;
ob = this_object();
me = this_player();

if( me->name() != ob->query("name1") && me->name() != ob->query("name2") )
return notify_fail("你并没有在下棋。\n"); 

if( ob->query("over") )
return notify_fail("这盘棋已经结束了。\n"); 

if( bche == "" && rche == "" )
return notify_fail("这样就认输了?\n"); 

message_vision(HIW"$N长叹一声“...我输了！...”\n"NOR,this_player());
ob->set("over", ob->query("name1") == me->name()?ob->query("name2"):
ob->query("name1") );

return 1;
}

int do_help(string arg)
{
if( arg == "cchess" ){
write(sprintf("%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n%s\n",
"———————————————————————————",
"中国象棋（cchess）",  
"———————————————————————————",
"下子   ：move <横座标> <纵座标> to <横座标> <纵座标>",
"重下      ：reset",
"读出残局  ：deploy",
"记录残局  ：csave",
"掷骰      ：toss",
"回顾      ：review",
"认输   ：lose",)
); 
return 1;
}
}

int do_review()
{
	write("目前走过的棋子。\n");
	write(aaa+"\n");
	return 1;
}

int do_reset(){
object me,ob;
me = this_player();
ob = this_object();
bb = 0;

if( ob->query("id2") )
if( (present(ob->query("id1"),environment(ob))) || 
(present(ob->query("id2"),environment(ob))) )
if( me->name() != ob->query("name1") && me->name() != ob->query("name2") && !ob->query("over") )
return notify_fail("比赛还在进行中，你不能乱动棋盘！\n"); 
if( restore() ){
setup();
        message_vision( "$N把棋盘重新摆好了。\n",this_player());
}

return 1;
}

