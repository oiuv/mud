// seaf.c 海战棋
// Make by 猫部猫(Catyboy)

#include <ansi.h>

#define WIDTH	9
#define HEIGHT	9
#define SHIP_NUM	10

inherit ITEM;

int has_start;
int game_mode;				// 开始攻击？0-布局 1-火力 2-开火 3-结束
int who_win;				// 胜利方 0=没有结束 -1=和手
mixed table;				// 两个棋盘 table = cell[9][9]
							// cell = ({ HasShip , HasFire })
mapping player;				// 两个玩家 [id:tableNumber(1,2)]
mixed player_action;		// 玩家的活动
mapping visitor;			// 两个玩家观战的人 [id:({id,...})]
mixed ship;					// 两个玩家的战船 ({ mixed({hasDest,x,y,fireX,fireY,fireValue}) ,...})
mixed numbers = ({"０","１","２","３","４","５","６","７","８","９"});
mixed cell_status = ({
			// 自己的棋盘
			({"～","＊","～"}),
			({"船","＠","船"}),
			// 敌方的棋盘
			({"～","＊","＃"}),
			({"～","Ｘ","＃"})
	});		// 棋格的状态
mixed fire_x,fire_y;
int reset_game(int all);

void msg(object me,object who,string msg)
{
	if(me)
		message_vision(msg,me,who);
	else
		tell_room(environment(this_object()),msg,0);
}

int player_id(string key)
{
	return player[key];
}

object get_player(string id)
{
	object ob;
	ob= find_player(id);
	if( !ob || environment(ob) != environment(this_object()) )
		return 0;
	return ob;
}

string enemy_id(string key)
{
	mixed *idx;
	int i;
	idx = keys(player);
	for(i=0;i<sizeof(idx);i++)
		if(idx[i]!=key)
			return idx[i];
	return 0;
}

object get_player2(int wHIYh)
{
	mixed *idx;
	int i;

	idx = keys(player);
	for(i=0;i<sizeof(idx);i++)
		if(player[idx[i]]==wHIYh)
			return get_player(idx[i]);
	return 0;	
}

int is_visitor(object who,string which)
{
	if(!get_player(which))
		return 0;
	if(!visitor[which]||member_array(who->query("id"),visitor[which])==-1)
		return 0;
	return 1;
}

int is_playing(object ob)
{
	string id;
	id = ob->query("id");
	if(player[id])
		return 1;
	return 0;
}

mixed get_table(string id)
{
	int i;
	if(i=player[id])
		return table[i-1];
	return 0;
}

mixed get_ship(string id)
{
	int i;
	if(i=player[id])
		return ship[i-1];
	return 0;
}

int remain_ship(string who)
{
	int i,c;
	mixed *sh;
	sh = get_ship(who);
	c = 0;
	for(i=0;i<SHIP_NUM;i++)
		if(!sh[i][0])c++;
	return c;
}

int remain_place(string who)
{
	int i,c;
	mixed *sh;
	sh = get_ship(who);
	c = 0;
	for(i=0;i<SHIP_NUM;i++)
		if(!sh[i][1])c++;
	return c;
}

int remain_fire(string who)
{
	int i,c;
	mixed *sh;
	sh = get_ship(who);
	c = 0;
	for(i=0;i<SHIP_NUM;i++)
		if(!sh[i][0]&&!sh[i][3])c++;
	return c;
}

void create()
{
	set_name("海战棋", ({ "sea board","board","seaf"}) );
	set_weight(1);
    if( clonep() )
		set_default_object(__FILE__);
	else
	{
		set("unit", "副");
        set("long", "这是一副海战棋，使用方法请使用(helpboard)命令。\n");
        set("value", 1);
        set("no_get", 1);
        set("material", "wood");
	}
    reset_game(1);
    setup();
}

string player_status(string key)
{
	mixed* sh;
	int i;
	string r;

	sh = get_ship(key);

	if(!sh)
		return "???";

	r = "";
	for(i=0;i<SHIP_NUM;i++)
	{
		if(sh[i][0])
			r+= HIR"Ｘ"NOR" ";
		else
			r+= HIB"船"NOR" ";
	}
	return r;
}

string build_board(string key)
{
	mixed *mt,*et,*d;
	string r;
	int x,y,id,mid,eid;

	id = player_id(key);
	if(!id)
		return "";
	if(id==1)
	{
		mid = 0;
		eid = 1;
	}
	else
	{
		mid = 1;
		eid = 0;
	}
	mt = table[mid];
	et = table[eid];
	
	r = "\n";
	r +=  "＊我军的情况＊　　　　　＊敌军的情况＊\n";
	r += "　１２３４５６７８９　　　１２３４５６７８９\n";
	for(y=0;y<HEIGHT;y++)
	{
		r = r+numbers[y+1];
		for(x=0;x<WIDTH;x++)
		{
			d = mt[x][y];
			if(game_mode == 2 && x == fire_x[mid]-1 && y == fire_y[mid]-1)
				r += BLINK + HIY + cell_status[d[0]][d[1]] + NOR;
			else
				r += cell_status[d[0]][d[1]];
		}

		r = r+"　　" + numbers[y+1];
		for(x=0;x<WIDTH;x++)
		{
			d = et[x][y];
			if(game_mode == 2 && x == fire_x[eid]-1 && y == fire_y[eid]-1)
				r += cell_status[d[0]+2][d[1]];
			else
				r += cell_status[d[0]+2][d[1]];
		}
		r+="\n";
	}
	r += "船只状态：" + player_status(key) + "\n";
	return r;
}

int reset_game(int all)
{
	int i,x,y;

	table = ({0,0});
	if(all)
	{
		player = ([]);
		visitor = ([]);
	}
	ship = ({0,0});
	player_action = ([]);

	for(i=0;i<2;i++)
	{
		table[i] = allocate(WIDTH);
		for(x=0;x<WIDTH;x++)
		{
			table[i][x] = allocate(HEIGHT);
			for(y=0;y<HEIGHT;y++)
				table[i][x][y] = ({0,0});
		}
		
		ship[i] = allocate(SHIP_NUM);
		for(x=0;x<SHIP_NUM;x++)
			ship[i][x] = ({0,0,0,0,0,0});
	}

	if(all)
		has_start = 0;
	return 1;
}

void display(int who)
{
	string b,id,m;
	int i,j;
	mixed* v;
	object ob,vtor;

	for(i=1;i<=2;i++)
	{
		if(!who||who==i)
		{
			ob = get_player2(i);
			if(ob)
			{
				id = ob->query("id");
				b = build_board(id);
				tell_object(ob,b);
				v = visitor[id];
				for(j=0;j<sizeof(v);j++)
				{
					vtor = find_player(v[j]);
					if(vtor)//&&environment(vtor) == environment(this_object()))
						tell_object(vtor,b);
				}
				
				switch(game_mode)
				{
				case 0:
					m = sprintf("布置船只：%d只\n",remain_place(ob->query("id")));
					m += "使用["HIY"place X坐标 Y坐标"NOR"]布置船只\n";
					m += "使用["HIY"unplace X坐标 Y坐标"NOR"]取消布置\n";
					m += "使用["HIY"rplace"NOR"]随机摆放船只\n";
					break;
				case 1:
					m = sprintf("布置火力：%d个\n",remain_fire(ob->query("id")));
					m += "使用["HIY"fire X坐标 Y坐标"NOR"]设置攻击位置\n";
					m += "使用["HIY"unfire X坐标 Y坐标"NOR"]取消设置\n";
					break;
				case 3:
					m = "战斗结束了。\n战况：";
					if(who_win==-1)
						m+="和手";
					else if(who_win==i)
						m+=HIY"胜利了"NOR;
					else
						m+=HBWHT BLK"失败了"NOR;
					break;
				}
				if(m)
					tell_object(ob,m);
			}
		}
	}
}

string extra_long()
{
	object who;
	string r,key;
	mixed *idx;
	int i;
	
	if(sizeof(player)>0)
	{
		idx = keys(player);
		r =	"******************************************\n";
		for(i=0;i<sizeof(idx);i++)
		{
			key = idx[i];
			who = get_player(key);
			if(who)
				r = r + key + "："+player_status(key)+"\n";
		}
		r += "******************************************\n";
	}
	return r;
}

int view_board(object who,string which)
{
	string b;
	object ob;
//	mixed *v;
	int /*i,*/see;

	ob = get_player(which);
	if(!ob)
		return 0;

	see = 0;
	if(ob==who)
		see = 1;

	if(!see)
		see = is_visitor(who,which);

	if(see)
	{
		b = build_board(which);
		tell_object(who,b);
		return 1;
	}
	return 0;
}

void start_game()
{
	has_start = 1;
	game_mode = 0;
	who_win = 0;

	msg(0,0,"开始游戏\n");
	display(0);
}

int before_fire()
{
	game_mode = 1;
	player_action = ([]);
	msg(0,0,"\n\n"HIC"！！！进入战备状态！！！"NOR"\n\n");
	display(0);
}

int start_fire()
{
	player_action = ([]);
	msg(0,0,"\n\n"HIR"！！！开始战斗状态！！！"NOR"\n\n");
	game_mode = 2;
	fire_x = ({0,0});
	fire_y = ({0,0});
	remove_call_out("fire_it");
	call_out("fire_it",2);
}

void init()
{

	add_action("do_help","helpboard");		// 帮助

	add_action("do_reset","reset");			// 重置游戏
	add_action("do_start","start");			// 重新开始
    add_action("do_join","join");			// 加入游戏

	add_action("do_view","view");			// 查看情况
	add_action("do_visitor","visit");		// 查看情况
	add_action("do_finish","finish");		// 完成

	add_action("do_place","place");			// 布置船只
	add_action("do_rplace","rplace");		// 随机摆放船只
	add_action("do_unplace","unplace");		// 取消船只

	add_action("do_fire","fire");			// 布置火力
	add_action("do_unfire","unfire");		// 取消火力


}

int do_reset(string arg)
{
//	mixed *idx;
//	int i;

	if(!this_object()->id(arg))
		return 0;

	if(!is_playing(this_player()))
	{
		if(get_player2(1)||get_player2(2))
			return notify_fail("你都不玩啊！\n");
	}
		
	if(reset_game(1))
		msg(this_player(),0,"$N重置了游戏。\n");
	return 1;
}

int do_start(string arg)
{
//	mixed *idx;
//	int i;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	reset_game(0);
	start_game();
	return 1;
}

int do_view(string arg)
{
//	mixed *idx;
//	int i;

	if(!is_playing(this_player()))
	{
		if(!arg)
			return notify_fail("你都不玩啊！\n");
		if(!is_visitor(this_player(),arg))
			return notify_fail("你不能够看"+arg+"的棋，可以使用[visit "+arg+"]命令成为"+arg+"的观众。\n");
	}
	if(!arg)
		arg = this_player()->query("id");
	if(!view_board(this_player(),arg))
		return notify_fail("？？？\n");
	return 1;
}

int do_join(string arg)
{
	object me;

	me = this_player();
	if(has_start)
		return notify_fail("游戏已经开始，不能加入了，请使用(reset)命令重置。\n");
	if(is_playing(me))
		return notify_fail("你已经参加了。\n");

	player[me->query("id")]=sizeof(player)+1;
	msg(me,0,"$N加入游戏了。\n");

	if(sizeof(player)==2)
		start_game();

	return 1;
}

int do_place(string arg)
{
	int i,x,y;
	mixed *sh,*tb;
	string id;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");
	
	if(!has_start||game_mode!=0)
		return notify_fail("现在不是布置船只的时候。\n");

	if( !arg || sscanf(arg, "%d %d", x, y)!=2 )
		return notify_fail("place X坐标 Y坐标\n");

	if(x<1||x>WIDTH)
		return notify_fail("X坐标错误\n");
	if(y<1||y>HEIGHT)
		return notify_fail("Y坐标错误\n");

	id = this_player()->query("id");
	sh = get_ship(id);
	tb = get_table(id);
	if(!sh||!tb)
		return notify_fail("access date fail\n");

	if(tb[x-1][y-1][0] == 1)
		return notify_fail("该处已经布置了船只\n");

	for(i=0;i<SHIP_NUM;i++)
	{
		if(!sh[i][1])
		{
			sh[i][1] = x;
			sh[i][2] = y;
			tb[x-1][y-1][0] = 1;
			break;
		}
	}

	if(i==SHIP_NUM)
		return notify_fail("你已经没有空余的船只可以布置了。\n");
	else
	{
		display(player_id(id));
		if(!remain_place(id))
			tell_object(this_player(),"\n使用[Finish]结束布置船只。\n");
	}
	return 1;
}

int do_unplace(string arg)
{
	int i,x,y;
	mixed *sh,*tb;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");
	
	if(game_mode!=0)
		return notify_fail("现在不是布置船只的时候。\n");

	if( !arg || sscanf(arg, "%d %d", x, y)!=2 )
		return notify_fail("unplace X坐标 Y坐标\n");

	if(x<1||x>WIDTH)
		return notify_fail("X坐标错误\n");
	if(y<1||y>HEIGHT)
		return notify_fail("Y坐标错误\n");

	sh = get_ship(this_player()->query("id"));
	tb = get_table(this_player()->query("id"));
	if(!sh||!tb)
		return notify_fail("access date fail\n");

	for(i=0;i<SHIP_NUM;i++)
	{
		if(sh[i][1]==x&&sh[i][2]==y)
		{
			sh[i][1] = 0;
			sh[i][2] = 0;
			tb[x-1][y-1][0] = 0;
			display(player_id(this_player()->query("id")));
			break;
		}
	}

	if(i==SHIP_NUM)
		return notify_fail("该位置没有布置船只。\n");
	return 1;
}

int do_finish(string arg)
{
//	int i,x,y;
	mixed *sh;
	string id;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");
	
	if(!(game_mode==0||game_mode==1))
		return notify_fail("？？？\n");

	id = this_player()->query("id");
	sh = get_ship(id);
	if(!sh)
		return notify_fail("access date fail\n");

	if(game_mode==0)
	{
		if(remain_place(id))
			return notify_fail("还有船只没有布置\n");
	}
	else if(game_mode==1)
	{
		if(remain_fire(id))
			return notify_fail("还有火力没有布置\n");
	}

	if(game_mode==0)
		msg(this_player(),0,"$N的船只布置完成\n");
	else if(game_mode==1)
		msg(this_player(),0,"$N的火力布置完成\n");

	player_action[this_player()->query("id")] = 1;
	if(sizeof(player_action)==2)
	{
		// all finish,go fire
		if(game_mode==0)
			before_fire();
		else if(game_mode==1)
			start_fire();
	}
	return 1;
}

int do_fire(string arg)
{
	int i,x,y;
	mixed *sh,*tb;
	string id;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");
	
	if(game_mode!=1)
		return notify_fail("现在不是布置火力的时候。\n");

	if( !arg || sscanf(arg, "%d %d", x, y)!=2 )
		return notify_fail("place X坐标 Y坐标\n");

	if(x<1||x>WIDTH)
		return notify_fail("X坐标错误\n");
	if(y<1||y>HEIGHT)
		return notify_fail("Y坐标错误\n");

	id = this_player()->query("id");
	sh = get_ship(id);
	tb = get_table(enemy_id(id));
	if(!sh||!tb)
		return notify_fail("access date fail\n");

	if(tb[x-1][y-1][1] != 0)
		return notify_fail("该处已经布置了火力\n");

	for(i=0;i<SHIP_NUM;i++)
	{
		if(!sh[i][0]&&!sh[i][3])
		{
			sh[i][3] = x;
			sh[i][4] = y;
			sh[i][5] = tb[x-1][y-1][1];
			tb[x-1][y-1][1] = 2;
			break;
		}
	}

	if(i==SHIP_NUM)
		return notify_fail("你已经没有空余的火力可以布置了。\n");
	else
	{
		display(player_id(id));
		if(i+1==SHIP_NUM)
			tell_object(this_player(),"\n使用[Finish]结束布置火力。\n");
	}
	return 1;
}

int do_unfire(string arg)
{
	int i,x,y;
	mixed *sh,*tb;
	string id;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");
	
	if(game_mode!=1)
		return notify_fail("现在不是布置火力的时候。\n");

	if( !arg || sscanf(arg, "%d %d", x, y)!=2 )
		return notify_fail("unplace X坐标 Y坐标\n");

	if(x<1||x>WIDTH)
		return notify_fail("X坐标错误\n");
	if(y<1||y>HEIGHT)
		return notify_fail("Y坐标错误\n");

	id = this_player()->query("id");
	sh = get_ship(id);
	tb = get_table(enemy_id(id));
	if(!sh||!tb)
		return notify_fail("access date fail\n");

	for(i=0;i<SHIP_NUM;i++)
	{
		if(!sh[i][0]&&sh[i][3]==x&&sh[i][4]==y)
		{
			sh[i][3] = 0;
			sh[i][4] = 0;
			tb[x-1][y-1][1] = sh[i][5];
			display(player_id(id));
			break;
		}
	}

	if(i==SHIP_NUM)
		return notify_fail("该位置没有布置火力。\n");
	return 1;
}

int which_ship(mixed* sh,int x,int y)
{
	int i;
	for(i=0;i<SHIP_NUM;i++)
	{
		if(sh[i][1]==x&&sh[i][2]==y)
			return i;
	}
	return -1;
}

int fire_it()
{
	int i,j1,j2,x,y,bFire;
	int r1,r2;
	string key1,key2;
	string m;
	mixed *sh1,*sh2;
	mixed *tb1,*tb2;
	
	key1 = keys(player)[0];
	key2 = keys(player)[1];
	sh1 = get_ship(key1);
	sh2 = get_ship(key2);
	tb1 = get_table(key1);
	tb2 = get_table(key2);

	game_mode = 2;

	m = 0;
	bFire = 0;

	fire_x = ({0,0});
	fire_y = ({0,0});

	if(sh1&&sh2)
	{
		for(i=0;i<SHIP_NUM;i++)
		{
			j1 = -1;
			j2 = -1;
			if(!sh1[i][0]&&sh1[i][3])
			{
				// fire it
				x = sh1[i][3];
				y = sh1[i][4];
				fire_x[0] = x;
				fire_y[0] = y;
				sh1[i][3] = 0;
				sh1[i][4] = 0;
				tb2[x-1][y-1][1] = 1;
				j2 = which_ship(sh2,x,y);
				bFire = 1;
			}

			if(!sh2[i][0]&&sh2[i][3])
			{
				// fire it
				x = sh2[i][3];
				y = sh2[i][4];
				fire_x[1] = x;
				fire_y[1] = y;
				sh2[i][3] = 0;
				sh2[i][4] = 0;
				tb1[x-1][y-1][1] = 1;
				j1 = which_ship(sh1,x,y);
				bFire = 1;
			}

			if(j1>=0)
			{
				m = BLINK HIY + key1 + "的船被击沉了。\n" NOR;
				sh1[j1][0] = 1;	// be fired
				if(sh1[j1][3])
				{
					x = sh1[j1][3];
					y = sh1[j1][4];
					sh1[j1][3] = 0;
					sh1[j1][4] = 0;
					tb2[x-1][y-1][1] = sh1[j1][5];
				}
			}
			if(j2>=0)
			{
				if(!m)m="";
				m = m + BLINK HIY + key2 + "的船被击沉了。\n" NOR;
				sh2[j2][0] = 1;	// be fired
				if(sh2[j2][3])
				{
					x = sh2[j2][3];
					y = sh2[j2][4];
					sh2[j2][3] = 0;
					sh2[j2][4] = 0;
					tb1[x-1][y-1][1] = sh2[j2][5];
				}
			}

			if(bFire)break;
		}
	}

	if(bFire)
	{
		msg(0,0,BLINK HIR"\n~~~~~ 攻击！！ ~~~~~\n"NOR);
		if(m)msg(0,0,m);
		display(0);
		remove_call_out("fire_it");
		call_out("fire_it",4);
	}
	else
	{
		// fire finish
		r1 = 0;
		r2 = 0;
		for(i=0;i<SHIP_NUM;i++)
		{
			if(!sh1[i][0])r1++;
			if(!sh2[i][0])r2++;
		}

		if(r1==0||r2==0)
		{
			game_mode = 3;
			if(r1==0)
			{
				if(r2==0)
					who_win = -1;
				else
					who_win = 1;
			}
			else
				who_win = 2;

			display(0);
			msg(0,0,HIR"\n\n 所有战斗结束了，使用(start)重新开始。\n"NOR);
		}
		else
		{
			msg(0,0,sprintf(HIC"\n该回合攻击结束...\n%s(%d) VS %s(%d)\n"NOR,key1,remain_ship(key1),key2,remain_ship(key2)));
			before_fire();
		}
	}
}

int do_visitor(string arg)
{
	string key;
	object me,ob;
	int del;

	if(!arg)
		return notify_fail("visit [-]玩家ID\n");

	if(sscanf(arg, "-d %s", key)==1 )
		del = 1;
	else
	{
		del = 0;
		key = arg;
	}
		
	me = this_player();
	if(is_playing(me))
	{
		ob = present(key,environment(this_object()));
		if(!ob)
			return notify_fail("这里没有这个玩家啊？\n");

		if(del)
		{
			if(!is_visitor(ob,me->query("id")))
				return notify_fail("不是你的观战者了。\n");

			msg(me,ob,"$N不再允许$n观看$N的战况。\n");
			visitor[me->query("id")] = visitor[me->query("id")] - ({ob->query("id")});
		}
		else
		{
			if(is_visitor(ob,me->query("id")))
				return notify_fail("已经是你的观战者了。\n");

			msg(me,ob,"$N让$n观看$N的战况。\n");
			if(!visitor[me->query("id")])
				visitor[me->query("id")] = ({ ob->query("id") });
			else
				visitor[me->query("id")] += ob->query("id");
		}
	}
	else
	{
		if(del)
			return notify_fail("？？？？\n");

		ob = get_player(key);
		if(!ob)
			return notify_fail("没有这个玩家在玩啊？\n");
		msg(me,ob,"$N希望成为$n的观战者。\n");
		tell_object(ob,"接受使用[visit "+me->query("id")+"]。\n");
	}
	return 1;
}

int do_rplace(string arg)
{
	int i,x,y;
	mixed *sh,*tb;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");
	
	if(!has_start||game_mode!=0)
		return notify_fail("现在不是布置船只的时候。\n");
	
	sh = get_ship(this_player()->query("id"));
	tb = get_table(this_player()->query("id"));
	for(i=0;i<SHIP_NUM;i++)
	{
		if(!sh||!tb)
			return notify_fail("access date fail\n");

		if(!sh[i][1])
		{
			x = random(WIDTH)+1;
			y = random(HEIGHT)+1;

			if(tb[x-1][y-1][0] != 1)
			{
				sh[i][1] = x;
				sh[i][2] = y;
				tb[x-1][y-1][0] = 1;
			}
		}
	}

	display(player_id(this_player()->query("id")));
	return 1;
}

int do_help(string arg)
{
	this_player()->start_more( @HELP
海战棋使用方法:
——[开始游戏]———————————————
帮助命令：helpboard
加入命令：join　　　　　加入游戏
开始命令：start 　　　　开始游戏
重置命令：reset board 　结束游戏

——[船只布置]———————————————
放置船只：place X坐标 Y坐标
取消放置：unplace X坐标 Y坐标
随机放置：rplace
放置结束：finish

——[火力布置]———————————————
放置火力：fire X坐标 Y坐标
取消放置：unfire X坐标 Y坐标
放置结束：finish

——[观战命令]———————————————
观战命令：visit [-d] 玩家ID
		邀请其它玩家观看你的游戏。
		加参数 -d 表示删除该玩家的观看资格。

——[游戏规则]———————————————
该游戏是两人游戏。
分为准备和战斗阶段两个阶段。

在准备阶段，各人把自己的船放置于自己的
棋盘上。当各人都准备好以后，进入战斗阶
段。

在战斗阶段，各人决定攻击的位置。每一艘
船有 1次攻击机会。在完成攻击设置以后，
进入战斗状态。系统根据双方的攻击设置进
行攻击，当攻击位置上有敌方船，则可以把
对方该船击毁。被击毁的船丧失攻击能力。

在所有攻击结束以后，重新进入攻击设置。
如此循环，直到一方的船全部被击毁。

游戏开始时候，每人有10艘船。
最后谁的船最先被全部消灭掉，谁为输者。

——————————————————————
			make by 猫部猫(Catyboy) v1.0
HELP
	);
        return 1;
}