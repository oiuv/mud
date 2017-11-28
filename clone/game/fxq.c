// fxq.c 飞行棋
// Make by 猫部猫(Catyboy)

#include <ansi.h>

inherit ITEM;

int has_start;

mixed wake_point;			// 出机点数

int cur_player;				// 当前的玩家ID
int cur_se;					// 当前色子数目
mixed *cur_qi;				// 当前移动的棋子
mixed shadow_qi;			// 当前移动的棋子的影子
int has_jump;				// 曾经跳跃过

mixed player;				// 2 or 4个玩家 [{ id,id,id,id }]

#define QI_SLEEP	0
#define QI_WAIT		1
#define QI_WALK		2
#define QI_END		3
#define QI_BACK		4
#define QI_MOVE		10

#define QI_FLAG		0
#define QI_X		1
#define QI_Y		2
#define QI_PLAYER	3
#define QI_ID		4
#define QI_MAX		5
mixed qizi;					// 棋子
							// ({棋子状态，棋子位置X，棋子位置Y,player,qi_id})

mixed player_start =		// 玩家的起点
({
	({14,10}),({4,14}),({0,4}),({10,0})
});
mixed player_ready =		// 玩家的出机位置
({
	({ ({14,12}),({13,12}),({12,12}),({11,12}) }),
	({ ({2,14}),({2,13}),({2,12}),({2,11}) }),
	({ ({0,2}),({1,2}),({2,2}),({3,2}) }),
	({ ({12,0}),({12,1}),({12,2}),({12,3}) }),
});
mixed super_hit =			// 超级跳跃的攻击点
({
	({3,7}),({7,3}),({11,7}),({7,11})
});


mixed qi_view =					// 玩家的棋子的外观
({
	({"１","２","３","４"}),	// 其他人看的棋子
	({"Ａ","Ｂ","Ｃ","Ｄ"}),	// 当前活动的棋子
});

mixed clr =
({
	"",HIR,HIY,HIB,HIG
});
mixed bkclr =
({
	"",HBRED,HBMAG,HBBLU,HBGRN
});

#define P_LEFT	1			// 路径
#define P_RIGHT	2
#define P_UP	4
#define P_DOWN	8

#define B_NORMAL	0
#define B_GATE		1		// 完成的道门
#define B_ROAD		2		// 完成的道
#define B_SJUMP		3		// 超级跳跃
#define B_END		4		// 结束
#define B_STOP		5		// 停机场
#define B_READY		6		// 出机场

#define BD_COLOR	0
#define BD_PATH		1
#define BD_FLAG		2
#define BD_PLAYER	3
#define BD_QI		4

mixed board =				// ({属性，路径，标志，玩家号，棋子号})
({
({ ({3,0,5,0,0 }),({3,0,5,0,0 }),      0       ,      0       ,({1,2,0,0,0 }),({2,2,0,0,0 }),({3,2,0,0,0 }),({4,2,1,0,0 }),({1,2,0,0,0 }),({2,2,0,0,0 }),({3,8,0,0,0 }),      0       ,({4,0,6,0,0 }),({4,0,5,0,0 }),({4,0,5,0,0 }),}),
({ ({3,0,5,0,0 }),({3,0,5,0,0 }),      0       ,      0       ,({4,4,0,0,0 }),      0       ,      0       ,({4,8,2,0,0 }),      0       ,      0       ,({4,8,0,0,0 }),      0       ,({4,0,6,0,0 }),({4,0,5,0,0 }),({4,0,5,0,0 }),}),
({ ({3,0,6,0,0 }),({3,0,6,0,0 }),({3,0,6,0,0 }),({3,0,6,0,0 }),({3,4,0,0,0 }),      0       ,      0       ,({4,8,2,0,0 }),      0       ,      0       ,({1,8,0,0,0 }),      0       ,({4,0,6,0,0 }),      0       ,      0       ,}),
({       0       ,      0       ,      0       ,      0       ,({2,4,3,0,0 }),      0       ,      0       ,({4,8,2,0,0 }),      0       ,      0       ,({2,10,0,0,0}),      0       ,({4,0,6,0,0 }),      0       ,      0       ,}),
({ ({2,2,0,0,0 }),({3,2,0,0,0 }),({4,2,0,0,0 }),({1,6,0,0,0 }),      0       ,      0       ,      0       ,({4,8,2,0,0 }),      0       ,      0       ,      0       ,({3,2,3,0,0 }),({4,2,0,0,0 }),({1,2,0,0,0 }),({2,8,0,0,0 }),}),
({ ({1,4,0,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({4,8,2,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({3,8,0,0,0 }),}),
({ ({4,4,0,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({4,8,4,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({4,8,0,0,0 }),}),
({ ({3,4,1,0,0 }),({2,2,2,0,0 }),({2,2,2,0,0 }),({2,2,2,0,0 }),({2,2,2,0,0 }),({2,2,2,0,0 }),({2,2,4,0,0 }),      0       ,({1,1,4,0,0 }),({1,1,2,0,0 }),({1,1,2,0,0 }),({1,1,2,0,0 }),({1,1,2,0,0 }),({1,1,2,0,0 }),({1,8,1,0,0 }),}),
({ ({2,4,0,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({2,4,4,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({2,8,0,0,0 }),}),
({ ({1,4,0,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({2,4,2,0,0 }),      0       ,      0       ,      0       ,      0       ,      0       ,      0       ,({3,8,0,0,0 }),}),
({ ({4,4,0,0,0 }),({3,1,0,0,0 }),({2,1,0,0,0 }),({1,1,3,0,0 }),      0       ,      0       ,      0       ,({2,4,2,0,0 }),      0       ,      0       ,      0       ,({3,9,0,0,0 }),({2,1,0,0,0 }),({1,1,0,0,0 }),({4,1,0,0,0 }),}),
({       0       ,      0       ,({2,0,6,0,0 }),      0       ,({4,5,0,0,0 }),      0       ,      0       ,({2,4,2,0,0 }),      0       ,      0       ,({4,8,3,0,0 }),      0       ,      0       ,      0       ,      0       ,}),
({       0       ,      0       ,({2,0,6,0,0 }),      0       ,({3,4,0,0,0 }),      0       ,      0       ,({2,4,2,0,0 }),      0       ,      0       ,({1,8,0,0,0 }),({1,0,6,0,0 }),({1,0,6,0,0 }),({1,0,6,0,0 }),({1,0,6,0,0 }),}),
({ ({2,0,5,0,0 }),({2,0,5,0,0 }),({2,0,6,0,0 }),      0       ,({2,4,0,0,0 }),      0       ,      0       ,({2,4,2,0,0 }),      0       ,      0       ,({2,8,0,0,0 }),      0       ,      0       ,({1,0,5,0,0 }),({1,0,5,0,0 }),}),
({ ({2,0,5,0,0 }),({2,0,5,0,0 }),({2,0,6,0,0 }),      0       ,({1,4,0,0,0 }),({4,1,0,0,0 }),({3,1,0,0,0 }),({2,1,1,0,0 }),({1,1,0,0,0 }),({4,1,0,0,0 }),({3,1,0,0,0 }),      0       ,      0       ,({1,0,5,0,0 }),({1,0,5,0,0 }),}),
});

mixed board_view =				// 棋盘视图 红黄蓝绿
({
	({ HBWHT HIB "●" NOR,HBWHT HIB "●" NOR,"　","　"    ,HIR "●" NOR,HIY "●" NOR,HIB "●" NOR,HIG "◆" NOR,HIR "●" NOR,HIY "●" NOR,HIB "●" NOR,    "←","　",HBWHT HIG "●" NOR,HBWHT HIG "●" NOR, }),
	({ HBWHT HIB "●" NOR,HBWHT HIB "●" NOR,"　","　"    ,HIG "●" NOR,    "　"    ,    "　"    ,HIG "●" NOR,    "　"    ,    "　"    ,HIG "●" NOR,    "　","　",HBWHT HIG "●" NOR,HBWHT HIG "●" NOR, }),
	({     "　"    ,    "　"    ,    "　"    ,    "　"    ,HIB "●" NOR,    "　"    ,    "　"    ,HIG "●" NOR,    "　"    ,    "　"    ,HIR "●" NOR,    "　"    ,    "　"    ,    "　"    ,    "　"    , }),
	({     "↓"    ,    "　"    ,    "　"    ,    "　"    ,HIY "★" NOR,HIY "→" NOR,HIY "→" NOR,HIG "●" NOR,HIY "→" NOR,HIY "→" NOR,HIY "●" NOR,    "　"    ,    "　"    ,    "　"    ,    "　"    , }),
	({ HIY "●" NOR,HIB "●" NOR,HIG "●" NOR,HIR "●" NOR,    "　"    ,    "　"    ,    "　"    ,HIG "●" NOR,    "　"    ,    "　"    ,    "　"    ,HIB "★" NOR,HIG "●" NOR,HIR "●" NOR,HIY "●" NOR, }),
	({ HIR "●" NOR,    "　"    ,    "　"    ,HIR "↑" NOR,    "　"    ,    "　"    ,    "　"    ,HIG "●" NOR,    "　"    ,    "　"    ,    "　"    ,HIB "↓" NOR,    "　"    ,    "　"    ,HIB "●" NOR, }),
	({ HIG "●" NOR,    "　"    ,    "　"    ,HIR "↑" NOR,    "　"    ,    "　"    ,    "　"    ,HIG "◎" NOR,    "　"    ,    "　"    ,    "　"    ,HIB "↓" NOR,    "　"    ,    "　"    ,HIG "●" NOR, }),
	({ HIB "◆" NOR,HIB "●" NOR,HIB "●" NOR,HIB "●" NOR,HIB "●" NOR,HIB "●" NOR,HIB "◎" NOR,HIC "※" NOR,HIR "◎" NOR,HIR "●" NOR,HIR "●" NOR,HIR "●" NOR,HIR "●" NOR,HIR "●" NOR,HIR "◆" NOR, }),
	({ HIY "●" NOR,    "　"    ,    "　"    ,HIR "↑" NOR,    "　"    ,    "　"    ,    "　"    ,HIY "◎" NOR,    "　"    ,    "　"    ,    "　"    ,HIB "↓" NOR,    "　"    ,    "　"    ,HIY "●" NOR, }),
	({ HIR "●" NOR,    "　"    ,    "　"    ,HIR "↑" NOR,    "　"    ,    "　"    ,    "　"    ,HIY "●" NOR,    "　"    ,    "　"    ,    "　"    ,HIB "↓" NOR,    "　"    ,    "　"    ,HIB "●" NOR, }),
	({ HIG "●" NOR,HIB "●" NOR,HIY "●" NOR,HIR "★" NOR,    "　"    ,    "　"    ,    "　"    ,HIY "●" NOR,    "　"    ,    "　"    ,    "　"    ,HIB "●" NOR,HIY "●" NOR,HIR "●" NOR,HIG "●" NOR, }),
	({     "　"    ,    "　"    ,    "　"    ,    "　"    ,HIG "●" NOR,HIG "←" NOR,HIG "←" NOR,HIY "●" NOR,HIG "←" NOR,HIG "←" NOR,HIG "★" NOR,    "　"    ,    "　"    ,    "　"    ,    "↑"    , }),
	({     "　"    ,    "　"    ,    "　"    ,    "　"    ,HIB "●" NOR,    "　"    ,    "　"    ,HIY "●" NOR,    "　"    ,    "　"    ,HIR "●" NOR,    "　"    ,    "　"    ,    "　"    ,    "　"    , }),
	({ HBWHT HIY "●" NOR,HBWHT HIY "●" NOR,"　","　"    ,HIY "●" NOR,    "　"    ,    "　"    ,HIY "●" NOR,    "　"    ,    "　"    ,HIY "●" NOR,    "　" ,"　",HBWHT HIR "●" NOR,HBWHT HIR "●" NOR, }),
	({ HBWHT HIY "●" NOR,HBWHT HIY "●" NOR,"　","→"    ,HIR "●" NOR,HIG "●" NOR,HIB "●" NOR,HIY "◆" NOR,HIR "●" NOR,HIG "●" NOR,HIB "●" NOR,    "　" ,"　",HBWHT HIR "●" NOR,HBWHT HIR "●" NOR, }),
});

mixed toss_text = ({
	({"","","","",""}),
	({
	    "┏━━━┐",
        "│      │",
        "│  ●  │",
        "│      │",
		"┖━━━┛",
	}),
	({
		"┏━━━┐",
        "│  ●  │",
        "│      │",
        "│  ●  │",
		"┖━━━┛",
	}),
	({
		"┏━━━┐",
		"│●　　│",
        "│　●　│",
        "│　　●│",
		"┖━━━┛",
	}),
	({
		"┏━━━┐",
        "│●　●│",
        "│　　　│",
        "│●　●│",
		"┖━━━┛",
	}),
	({
		"┏━━━┐",
        "│●　●│",
        "│　●　│",
        "│●　●│",
		"┖━━━┛",
	}),
	({
		"┏━━━┐",
        "│●　●│",
        "│●　●│",
        "│●　●│",
		"┖━━━┛",
	})
});

int return_base(int pl_num,int qi_num)
{
	int x,y;
	x = (pl_num==3 || pl_num==2)?0:13;
	y = (pl_num==1 || pl_num==2)?13:0;
	
	x = (qi_num==1 || qi_num==3)?x:x+1;
	y = (qi_num==1 || qi_num==2)?y:y+1;

	qizi[pl_num-1][qi_num-1][QI_FLAG] = QI_SLEEP;
	qizi[pl_num-1][qi_num-1][QI_X] = x;
	qizi[pl_num-1][qi_num-1][QI_Y] = y;

	board[y][x][BD_PLAYER] = pl_num;
	board[y][x][BD_QI] = qi_num;
	
	return 1;
}

int reset_game(int all)
{
	int i,j;
//	string* idx;
//	object ob;

	if(all)has_start = 0;
	cur_player = 0;
	if(all)player = ({0,0,0,0});
	if(all)wake_point = ({6});
	qizi = allocate(4);					// 4副棋子
	for(i=0;i<4;i++)
	{
		qizi[i] = allocate(4);			// 4个棋子/1副
		for(j=0;j<4;j++)
			qizi[i][j] = ({0,0,0,i+1,j+1});	// 5个状态/1个棋子
	}

	for(i=0;i<15;i++)
	{
		for(j=0;j<15;j++)
		if(board[i][j])
		{
			board[i][j][BD_PLAYER] = 0;
			board[i][j][BD_QI] = 0;
		}
	}

	for(i=0;i<4;i++)
	{
		for(j=0;j<4;j++)
			return_base(i+1,j+1);
	}
}

void msg(object me,object who,string msg)
{
	if(me)
		message_vision(msg,me,who);
	else
		tell_room(environment(this_object()),msg,0);
}

object get_player(string id)
{
	object ob;
	if(!id)return 0;

	ob= find_player(id);
	if( !ob || environment(ob) != environment(this_object()) )
		return 0;
	return ob;
}

string player_id(int num)
{
	return player[num];
}

int player_number(string id)
{
	int i;
	for(i=0;i<sizeof(player);i++)
		if(player[i] == id)
			return i+1;
	return 0;
}

object get_cur_player()
{
	return get_player(player_id(cur_player-1));
}

string player_info(int id)
{
	object ob;

	if(id<=4 && id>0)
	{
		if(player[id-1])
		{
			ob = get_player(player[id-1]);
			return sprintf("%s%d"NOR" %s",clr[id],id,ob?ob->query("name")+"("+ob->query("id")+")":"???");
		}
	}
	else
	{
		if(cur_player && ob = get_cur_player())
		{
			if(cur_se)
				return sprintf("%s%d"NOR" %s [%d]",clr[cur_player],cur_player,ob->query("name")+"("+ob->query("id")+")",cur_se);
			else
				return sprintf("%s%d"NOR" %s",clr[cur_player],cur_player,ob->query("name")+"("+ob->query("id")+")");
		}
	}
	return "";
}

int is_playing(object ob)
{
	string id;
	id = ob->query("id");
	return player_number(id);
}

mixed qi2ge(mixed qi)
{
	int x,y;
	if(!qi)return 0;
	x = qi[QI_X];
	y = qi[QI_Y];
	return board[y][x];
}

mixed ge2qi(mixed ge)
{
	int pl,q;

	if(!ge)return 0;
	pl = ge[BD_PLAYER];
	q =  ge[BD_QI];
	if(pl&&q)
		return qizi[pl-1][q-1];
	return 0;
}

object qi2player(mixed* qi)
{
	object ob;
	string id;
	
	id = player_id(qi[QI_PLAYER]-1);
	if(!id)return 0;
	ob= find_player(id);
	if( !ob || environment(ob) != environment(this_object()) )
		return 0;
	return ob;
}

void shadow_it(mixed* qi)
{
	int i;

	shadow_qi = allocate(QI_MAX);
	for(i=0;i<QI_MAX;i++)
		shadow_qi[i] = qi[i];
}

// 开始构造物体
void create()
{
	set_name("飞行棋", ({ "fei xing qi","qi","fxq"}) );
	set_weight(1);
    if( clonep() )
		set_default_object(__FILE__);
	else
	{
		set("unit", "副");
        set("long", "这是一副飞行棋，使用方法请使用(helpqi)命令。\n");
        set("value", 1);
        set("no_get", 1);
        set("material", "paper");
	}

	reset_game(1);
    setup();
}

string build_qi(object who)
{
	string id,t,r,cell;
	int num,q;
	int x,y;
	mixed* ln;
	mixed* ge;
	mixed* qi;

	if(who)
		id = who->query("id");
	r = "";

	for(y=0;y<sizeof(board_view);y++)
	{
		ln = board_view[y];
		for(x=0;x<sizeof(ln);x++)
		{
			ge = board[y][x];
			qi = 0;

			if(ge)
			{
				if(cur_qi)
				{
					if(cur_qi[QI_X] == x && cur_qi[QI_Y] == y)
						qi = cur_qi;
					else if(shadow_qi[QI_X] == x && shadow_qi[QI_Y] == y)
						qi = shadow_qi;
					else
						qi = ge2qi(ge);
				}
				else
					qi = ge2qi(ge);

				if( qi && num = qi[QI_PLAYER])
				{
					q = qi[QI_ID];

					if(qi==shadow_qi)
						t = "Ｓ";
					else if(player[num-1]==id && cur_player==num) // 自己的棋子
						t = clr[num]+qi_view[1][q-1];
					else
						t = clr[num]+qi_view[0][num-1];

					switch(qi[0])
					{
					case QI_END:
						cell = sprintf("%s%s" NOR,clr[num],"〓");
						break;
					case QI_WAIT:
						if(qi != shadow_qi)
						{
							cell = sprintf("%s" NOR,t);
							break;
						}
					case QI_WALK:
					case QI_BACK:
						if(qi == cur_qi || qi == shadow_qi)
						{
							cell = sprintf(BLINK "%s%s" NOR,bkclr[ge[BD_COLOR]],t);
							break;
						}
					case QI_SLEEP:
					default:
						cell = sprintf("%s%s" NOR,bkclr[ge[BD_COLOR]],t);
						break;
					}
				}
				else
					cell = ln[x];
			}
			else
				cell = ln[x];
			r += cell;
		}

		if(y<4)
			r+=" " + player_info(y+1);
		if(y==7)
			r+=" " + player_info(0);
		r+="\n";
	}
	return r;
}

void init()
{
        add_action("do_help","helpqi");                 // 帮助
	
	add_action("do_reset","reset");			// 重置游戏
	add_action("do_start","start");			// 重新开始
    add_action("do_join","join");			// 加入游戏

	add_action("do_toss","toss");			// 摇色子
	add_action("do_view","view");			// 查看情况
	add_action("do_move","move");			// 移动

	add_action("do_next","next");			// 催促
}

void show_se(int se)
{
	msg(0,0,implode(toss_text[se],"\n")+"\n");
}

int do_next(string arg)
{
	object ob;
	object me;
	
	me = this_player();
	if(me)
	{
		if(!is_playing(me))
			return notify_fail("你都不玩啊！\n");

		if(!has_start)
			return notify_fail("还没有开始了。\n");
		if(!cur_player)
			return notify_fail("？？？？\n");

		ob = get_cur_player();
		
		if(ob==0)
			return msg(0,0,"有玩家缺场了，请重新开始游戏(reset qi)。\n");

		if(me!=ob)
			msg(me,ob,"$N对$n说道：到你了。\n");
		else
			msg(me,0,"$N对自己说道：到我啦！\n");
	}
	else
	{
		ob = get_cur_player();
		msg(0,ob,"到$n了。\n");
	}
	return 1;
}

void next_one()
{
	int i,j;
	int cp;

	cp = 0;
	if(cur_se==6)
		cp = cur_player;
	else
		cp = cur_player<4?cur_player+1:1;
	cur_se = 0;
	cur_qi = 0;
	shadow_qi = 0;
	has_jump = 0;
	
	j = 0;
	for(j=0;j<4;j++)
	{
		for(i=0;i<4;i++)
		{
			if(qizi[cp-1][i][QI_FLAG] != QI_END)
			{
				if(cp == cur_player)
					msg(get_cur_player(),0,"$N投到六点，奖励一次。\n");
				else
				{
					cur_player = cp;
					do_next("");
				}
				return;
			}
		}
		cp = cp<4?cp+1:1;
	}
}

int toss(object who,int se)
{
	string r,cmd;
	string cmd1,cmd2;
	int i,pid;
	int c;

	pid = cur_player;

	r = build_qi(who);
	c = 0;
	for(i=0;i<4;i++)
	{
		switch(qizi[pid-1][i][QI_FLAG])
		{
		case QI_SLEEP:
			if(member_array(se,wake_point)!=-1)
			{
				if(cmd1)
					cmd1 = sprintf("%s|%c",cmd1,'a'+i);
				else
					cmd1 = sprintf("出机 move %c",'a'+i);
				c = 1;
			}
			break;
		case QI_WAIT:
		case QI_WALK:
		case QI_BACK:
			if(cmd2)
				cmd2 = sprintf("%s|%c",cmd2,'a'+i);
			else
				cmd2 = sprintf("移动 move %c",'a'+i);
			c = 1;
			break;
		case QI_END:
			break;
		default:
			msg(0,0,"\n错误飞机状态！！！\n");
			break;
		}
	}

	cmd = sprintf("%d点\n",se);
	if(cmd1)cmd = sprintf("%s%s\n",cmd,cmd1);
	if(cmd2)cmd = sprintf("%s%s\n",cmd,cmd2);

	if(c)
	{
		tell_object(who,r);
		tell_object(who,cmd);
	}
	else
		next_one();
	return 1;
}

int do_toss(string arg)
{
	int se,pid;
	object me;

	me = this_player();

	if(!(pid = is_playing(me)))
		return notify_fail("你都不玩啊！\n");
	if(!has_start)
		return notify_fail("游戏还没有开始了。\n");
	if(cur_se)
		return notify_fail("不是投色子的时候。\n");
	if(!cur_player||me->query("id")!=player[cur_player-1])
		return notify_fail("还没有开始到你了。\n");

	msg(me,0,"$N拿起色子在手中摇了两摇。\n");
	se = random(6)+1;
	show_se(se);

	cur_se = se;
	toss(me,se);
	
	return 1;
}

string extra_long()
{
	object me;
//	object who;
	string r/*,r2*/;
//	int i;

	me = this_player();
	r = "\n"+build_qi(me);
	return r;
}

int do_reset(string arg)
{
	int i;
	mixed* idx;

	if(!this_object()->id(arg))
		return 0;

	if(!is_playing(this_player()))
	{
		for(i=0;i<sizeof(idx);i++)
		{
			if(get_player(player[i]))
				return notify_fail("你都不玩啊！\n");
		}
	}
	reset_game(1);
	msg(this_player(),0,"$N重置了游戏。\n");
	return 1;
}

int do_start(string arg)
{
	int i/*,c*/;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	for(i=0;i<sizeof(player);i++)
		if(!player[i])break;

	switch(i)
	{
	case 2:
		player[2] = player[0];
		player[3] = player[1];
		break;
	case 4:
		break;
	default:
		return notify_fail("游戏人数只能是2人 或者 4人。\n");
		break;
	}
	
	reset_game(0);
	has_start = 1;
	cur_player = 1;

	msg(this_player(),0,"$N开始游戏了\n");
	msg(get_cur_player(),0,"$N首先投色。\n");
		
	return 1;
}

int do_view(string arg)
{
	write(build_qi(this_player()));
	return 1;
}

int do_join(string arg)
{
	int i;
	object me;

	me = this_player();
	if(has_start)
		return notify_fail("游戏已经开始，不能加入了，请使用(reset)命令重置。\n");
	if(is_playing(me))
		return notify_fail("你已经参加了。\n");

	for(i=0;i<sizeof(player);i++)
	{
		if(!player[i])
		{
			player[i] = me->query("id");
			msg(me,0,"$N加入游戏了。\n");
			if(i==3)
				msg(0,0,"请使用(start)命令开始游戏。\n");
			return 1;
		}
	}
	return notify_fail("人数已满\n");
}

void show_qi()
{
	string r;
	r = build_qi(0);
	msg(0,0,"\n\n"+r);
}

void put_down(mixed* qi)
{
	mixed* ge;
	ge = qi2ge(qi);
	if(ge)
	{
		ge[BD_PLAYER] = qi[QI_PLAYER];
		ge[BD_QI] = qi[QI_ID];
	}
}

void pick_out(mixed* qi)
{
	mixed* ge;
	ge = qi2ge(qi);
	if(ge && ge[BD_PLAYER] == qi[QI_PLAYER] && ge[BD_QI] == qi[QI_ID])
	{
		ge[BD_PLAYER] = 0;
		ge[BD_QI] = 0;
	}
}

int check_finish()
{
	int i,j;
	for(i=0;i<4;i++)
		for(j=0;j<4;j++)
			if(qizi[i][j][QI_FLAG] != QI_END)return 0;
	return 1;
}

int reach(mixed* qi)
{
	mixed* ge;
	mixed* qi2;

	ge = qi2ge(qi);

	if(ge[BD_PLAYER])
	{
		// 有其他棋子?
		if(ge[BD_PLAYER] == qi[QI_PLAYER])
		{
			// 自己，奖励一步
			msg(get_cur_player(),0,"$N和自己的飞机相遇，前进一步。\n");
			call_out("jump_to",0,qi,1);
			return 1;
		}
		else
		{
			// hit it
			qi2 = ge2qi(ge);
			msg(get_cur_player(),qi2player(qi2),BLINK HIR "\n$N击毁了$n的飞机！！！\n\n" NOR);
			return_base(qi2[QI_PLAYER],qi2[QI_ID]);
		}
	}
	else
	{
		switch(ge[BD_FLAG])
		{
		case B_NORMAL:
			if(qi[QI_PLAYER] == ge[BD_COLOR] && !has_jump)
			{
				msg(get_cur_player(),0,"$N的飞机进行跳跃...\n");
				call_out("jump_to",0,qi,4);
				return 1;
			}
			break;
		case B_SJUMP:		// 超级跳跃
			if(qi[QI_PLAYER] == ge[BD_COLOR] && !has_jump)
			{
				msg(get_cur_player(),0,HIY "\n$N的飞机进行超级跳跃！\n");

				qi2 = ge2qi(ge);
				if(qi2)
				{
					msg(get_cur_player(),qi2player(qi2),BLINK HIR "\n$N击毁了$n的飞机！！！\n\n" NOR);
					return_base(qi2[QI_PLAYER],qi2[QI_ID]);
				}
				call_out("jump_to",0,qi,12);
				return 1;
			}
			break;
		case B_END:			// 结束
			msg(get_cur_player(),0,"$N的一架飞机到终点了。\n");
			return_base(qi[QI_PLAYER],qi[QI_ID]);
			qi[QI_FLAG] = QI_END;
			if(check_finish())
				return 1;
			next_one();
			return 1;
		default:
			break;
		}
	}
	put_down(qi);
	next_one();
	return 1;
}

int jump_to(mixed* qi,int w)
{
	int i;
	int ox,oy,p;
	mixed* ge;

	has_jump = 1;

	for(i=0;i<w;i++)
	{
		ge = qi2ge(qi);
		p = ge[BD_PATH];

		ox = 0;
		oy = 0;
		if(p & P_LEFT)ox --;
		if(p & P_RIGHT)ox ++;
		if(p & P_UP)oy --;
		if(p & P_DOWN)oy ++;

		qi[QI_X]+=ox;
		qi[QI_Y]+=oy;
	}
	show_qi();
	reach(qi);
	return 1;
}

int move_qi(mixed* qi,int pt)
{
	int i,x,y;
	int ox,oy,p,q;
	mixed* ge;

	switch(qi[0])
	{
	case QI_SLEEP:
		if(member_array(pt,wake_point)==-1)
			return notify_fail("不能移动该棋子。\n");
		qi[QI_FLAG] = QI_WAIT;
		pick_out(qi);
		q = qi[QI_PLAYER];
		for(i=0;i<4;i++)
		{
			x = player_ready[q-1][i][0];
			y = player_ready[q-1][i][1];
			if(!board[y][x][BD_PLAYER])
			{
				qi[QI_X] = x;
				qi[QI_Y] = y;
				i = 5;
			}
		}
		put_down(qi);

		msg(get_cur_player(),0,"$N准备出动一架飞机。\n");
		next_one();
		return 1;
	case QI_WAIT:
		pt--;
		x = player_start[cur_player-1][0];
		y = player_start[cur_player-1][1];
		pick_out(qi);
		qi[QI_FLAG] = QI_WALK;
		qi[QI_X] = x;
		qi[QI_Y] = y;
		
		if(pt==0)
		{
			show_qi();
			reach(qi);
		}
		else
		{
			if(!move_qi(qi,pt))
				return 0;
		}
		break;
	case QI_WALK:
		pick_out(qi);
				
		pt --;
		ge = qi2ge(qi);

		if(ge[BD_FLAG] == B_GATE && qi[QI_PLAYER] == ge[BD_COLOR])
		{
			switch(ge[BD_COLOR])
			{
			case 1:
				p = 1;
				break;
			case 2:
				p = 4;
				break;
			case 3:
				p = 2;
				break;
			case 4:
				p = 8;
				break;
			}
		}
		else
			p = ge[BD_PATH];

		ox = 0;
		oy = 0;
		if(p & P_LEFT)ox --;
		if(p & P_RIGHT)ox ++;
		if(p & P_UP)oy --;
		if(p & P_DOWN)oy ++;

		qi[QI_X]+=ox;
		qi[QI_Y]+=oy;

		ge = qi2ge(qi);
		
		if(pt==0)
		{
			show_qi();
			reach(qi);
		}
		else
		{
			if(ge[BD_FLAG] == B_END)
				qi[QI_FLAG] = QI_BACK;
			if(!move_qi(qi,pt))
				return 0;
		}
		break;
	case QI_BACK:
		{
			ge = qi2ge(qi);

			p = ge[BD_PATH];
			ox = 0;
			oy = 0;
			if(p & P_LEFT)ox --;
			if(p & P_RIGHT)ox ++;
			if(p & P_UP)oy --;
			if(p & P_DOWN)oy ++;

			qi[QI_X]-=ox;
			qi[QI_Y]-=oy;

			pt--;
			if(pt==0)
			{
				qi[QI_FLAG] = QI_WALK;
				show_qi();
				reach(qi);
			}
			else
			{
				if(!move_qi(qi,pt))
					return 0;
			}
		}
		break;
	case QI_END:
		return notify_fail("不能移动该棋子。\n");
	default:
		msg(0,0,"\n错误飞机状态！！！\n");
		break;
	}
	return 1;
}

int do_move(string arg)
{
	int pid;
	int w;
	object me;
	mixed* qi;

	me = this_player();

	if(!(pid = is_playing(me)))
		return notify_fail("你都不玩啊！\n");
	if(!has_start)
		return notify_fail("游戏还没有开始了。\n");
	if(!cur_se)
		return notify_fail("是投色子的时候。\n");
	if(!cur_player||me->query("id")!=player[cur_player-1])
		return notify_fail("还没有开始到你了。\n");

	if(!arg)
		return notify_fail("你要移动哪个棋子啊(a|b|c|d)？\n");

	w = 0;
	if(arg=="a")
		w = 1;
	if(arg=="b")
		w = 2;
	if(arg=="c")
		w = 3;
	if(arg=="d")
		w = 4;

	if(!w)
		return notify_fail("你要移动哪个棋子啊(a|b|c|d)\n");

	qi = qizi[cur_player-1][w-1];
	cur_qi = qi;
	shadow_it(qi);
	if(!move_qi(qi,cur_se))
		return 0;
	return 1;
}

mixed t(int x,int y)
{
	return board[x][y];
}

int do_help(string arg)
{
	this_player()->start_more( @HELP
飞行棋使用方法:
——[开始游戏]———————————————
帮助命令：helpqi
加入游戏：join　　　　　
开始游戏：start
重置游戏：reset qi

——[游戏命令]———————————————
　摇色子：toss
查看情况：view
移动棋子：move a|b|c|d
催促玩家：next

——[游戏规则]———————————————
普通的飞行棋。

——————————————————————
			make by 猫部猫(Catyboy) v1.0
HELP
	);
        return 1;
}