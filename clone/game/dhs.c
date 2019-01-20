// dhs.c 大话色
// Make by 猫部猫(Catyboy)

#include <ansi.h>

#define MAX_SE		6
#define MAX_TOSS	5

inherit ITEM;

int has_start;
int has_guess;
int se_num;					// 每人的色子数量
int se_total;				// 每人的色子数量2
int cur_point;				// 当前的点数
int cur_amount;				// 当前的数量
int has_guess_one;			// 是否猜过１
string cur_player;			// 当前的玩家ID
string last_player;			// 上一个玩家
string who_lost;			// 输方
mapping player;				// 两个玩家 [id:({色，色...})]
mapping player_deal;		// 完成的玩家
mapping player_toss;		// 玩家toss次数
mapping player_follow;		// 玩家顺序
mapping visitor;			// 观战的人 [id:({id,...})]
mapping counter = ([]);		// 计数器
mixed	history;				// 历史 string
int reset_game(int all);

mixed se_text = ({
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
	ob= find_player(id);
	if( !ob || environment(ob) != environment(this_object()) )
		return 0;
	return ob;
}

object get_cur_player()
{
	return get_player(cur_player);
}

int is_playing(object ob)
{
	string id;
	id = ob->query("id");
	if(undefinedp(player[id]))
		return 0;
	return 1;
}

mixed get_se(int num)
{
	return se_text[num];
}

void create()
{
	set_name("大话色台", ({ "da hua se desk","se","desk","dhs"}) );
	set_weight(1);
    if( clonep() )
		set_default_object(__FILE__);
	else
	{
		set("unit", "张");
        set("long", "这是一张大话色台，玩家可以在上面玩大话色，使用方法请使用(helpse)命令。\n");
        set("value", 1);
        set("material", "wood");
	}

	se_total = 5;
        reset_game(1);
    setup();
}

string for_other_msg(object who)
{
	object ob;
	string m;

	m = "";
	if(has_guess&&last_player)
	{
		ob = get_player(last_player);
		if(ob)
		{
			m = sprintf("%s\n%s(%s)猜色子数为：%d个%d\n",m,ob->query("name"),ob->query("id"),cur_amount,cur_point);
			if(ob!=who)
				m = m + "如果你不相信，可以拆穿大话("HIY"dahua "+ob->query("id")+NOR")\n";
		}
	}
	return m;
}

string for_guess_msg()
{
	string m;

	m = "";
	if( has_guess&&last_player )
		m=m+for_other_msg(0)+"否则";
	m = m+"你的猜测是("HIY"guess 色子数目 色子点数"NOR")？\n";
	if(has_guess&&last_player)
		m = m+"注意：" HIC "色子数目或者色子点数必须比前一位玩家大。\n"NOR;
	return m;
}

int is_visitor(object who,string which)
{
	if(!get_player(which))
		return 0;

	if(!visitor[which]||member_array(who->query("id"),visitor[which])==-1)
		return 0;
	return 1;
}

string build_se(object who)
{
	mixed *s;
	string r,t;
	int i,y,num;
//	object ob;

	if(!who)
		return "";

	r = "";
	if(s = player[who->query("id")])
	{
		for(y=0;y<5;y++)
		{
			t = "";
			for(i=0;i<sizeof(s);i++)
			{
				num = s[i];
				t = t + se_text[num][y] + "　";
			}
			r = r + t + "\n";
		}
		if(has_guess&&last_player)
			r = r + for_other_msg(who);
	}
	return r;
}

void toss(object ob)
{
	int i;
	mixed* s;

	if(!ob)
		return;
	if(s = player[ob->query("id")])
	{
		for(i=0;i<sizeof(s);i++)
			s[i] = random(6)+1;
	}
	player[ob->query("id")] = sort_array(s,1);
}

int auto_order()
{
	int i;
	string* key;
	string who,start_one;

	key = keys(player);
	player_follow = ([]);
	who = "";
	for(i=0;i<sizeof(key);i++)
	{
		if(get_player(key[i]))
		{
			if(!start_one)
				start_one = key[i];
			if(who =="")
				who = key[i];
			else
			{
				player_follow[who] = key[i];
				who = key[i];
			}
		}
	}
	player_follow[who] = start_one;
	return 1;
}

int reset_game(int all)
{
	int i;
	string* idx;
	object ob;

	if(all)has_start = 0;
	has_guess = 0;
	se_num = se_total;
	cur_point = 0;
	cur_amount = 0;
	cur_player = 0;
	has_guess_one = 0;
	last_player = 0;
	if(all)who_lost = 0;
	if(all)player = ([]);
	player_deal = ([]);
	player_toss = ([]);
	player_follow = ([]);
	if(all)visitor = ([]);
	if(all)counter = ([]);
	history = 0;
	if(!all)
	{
		idx = keys(player);
		for(i=0;i<sizeof(idx);i++)
		{
			if(ob = get_player(idx[i]))
			{
				player[idx[i]] = allocate(se_num);
				toss(ob);
			}
			else
				map_delete(player,idx[i]);
		}
		auto_order();
	}
	return 1;
}

string extra_long()
{
	object who;
	string r;
	mixed *idx;
	int i;
	
	if(sizeof(player)>0)
	{
		idx = keys(player);
		r =	"******************************************\n";
		for(i=0;i<sizeof(idx);i++)
		{
			who = get_player(idx[i]);
			if(who) r = r + who->short() + "\n";
		}
		r += "******************************************\n";
	}
	return r;
}

int view_se(object who,object bsee)
{
	if(who)
	{
		if(bsee)
			tell_object(bsee,build_se(who));
		else
			tell_object(who,build_se(who));
	}
	return 1;
}

void start_game(int num)
{
	if(num>1&&num<=MAX_SE)
		se_total = num;
	reset_game(0);
	has_start = 1;
	msg(0,0,"开始游戏了\n");
}

void init()
{

	add_action("do_help","helpse");			// 帮助

	add_action("do_reset","reset");			// 重置游戏
	add_action("do_start","start");			// 重新开始
    add_action("do_join","join");			// 加入游戏

	add_action("do_toss","toss");			// 摇色子
	add_action("do_view","view");			// 查看情况
	add_action("do_finish","finish");		// 完成
	add_action("do_finish","deal");			// 完成

	add_action("do_dahua","dahua");			// 发现大话
	add_action("do_guess","guess");			// 猜测
	add_action("do_guess","g");				// 猜测

	add_action("do_next","next");			// 催促
	add_action("do_showc","showc");			// 显示计数器
	add_action("do_visitor","visit");		// 增加旁观者
	add_action("do_history","history");		// 查看猜测历史
}

int do_toss(string arg)
{
	object me,v;
	string* idx;
	int i;

	me = this_player();

	if(!is_playing(me))
		return notify_fail("你都不玩啊！\n");
	if(!has_start)
		return notify_fail("游戏还没有开始了。\n");
	if(has_guess)
		return notify_fail("已经开始猜色子了。\n");
	if(player_toss[me->query("id")]>=MAX_TOSS)
		return notify_fail(sprintf("你已经摇过%d次了。\n",MAX_TOSS));

	toss(me);
	player_toss[me->query("id")]++;
	msg(me,0,"$N拿起色子在手中摇了两摇。\n");
	view_se(me,0);

	if(idx = visitor[me->query("id")])
	{
		for(i=0;i<sizeof(idx);i++)
		{
			v = get_player(idx[i]);
			if(v)
				view_se(me,v);
		}
	}	
	return 1;
}

int do_reset(string arg)
{
	int i;
	mixed* idx;

	if(!this_object()->id(arg))
		return 0;

	if(!is_playing(this_player()))
	{
		idx = keys(player);
		for(i=0;i<sizeof(idx);i++)
		{
			if(get_player(idx[i]))
				return notify_fail("你都不玩啊！\n");
		}
	}
		
	reset_game(1);
	msg(this_player(),0,"$N重置了游戏。\n");
	return 1;
}

int do_start(string arg)
{
	int i;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(sizeof(player)<2)
		return notify_fail("至少要两个人才能玩。\n");

	if(!arg||sscanf(arg,"%d",i)!=1)
		i = 0;
	else
	{
		if(i<1||i>MAX_SE)
			return notify_fail(sprintf("start [色子数目]  *注意* 色子数目必须>1并且<=%d\n",MAX_SE));
	}
	start_game(i);
	return 1;
}

int do_view(string arg)
{
	object me;
	object ob;

	me = this_player();
	
	if(!is_playing(me))
	{
		if(arg&&(ob = get_player(arg)))
			if(!is_visitor(me,arg))
				ob = 0;

		if(!ob)
			return notify_fail("你都不玩啊！\n");
	}
	else
		ob = me;
	
	view_se(ob,me);
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

	player[me->query("id")]=allocate(se_num);
	toss(me);
	msg(me,0,"$N加入游戏了。\n");
	return 1;
}

int do_next(string arg)
{
	object ob;
	object me;
	
	me = this_player();
	if(!is_playing(me))
		return notify_fail("你都不玩啊！\n");

	if(!has_guess)
		return notify_fail("还没有开始猜色子了。\n");
	if(!cur_player)
		return notify_fail("现在是谁猜啊？\n");

	ob = get_cur_player();
	
	if(ob==0)
		return msg(0,0,"有玩家缺场了，请重新开始游戏(start)。\n");

	if(me!=ob)
		msg(me,ob,"$N对$n说道：到你了。\n");
	else
		msg(me,0,"对自己说道：到我啦！\n");
	tell_object(ob,for_guess_msg());
	return 1;
}

int do_guess(string arg)
{
	int n,p,ok;
	object ob;
	object me;
//	string nextone;
	
	me = this_player();
	if(!is_playing(me))
		return notify_fail("你都不玩啊！\n");

	if(!has_guess)
		return notify_fail("还没有开始猜色子了。\n");
	ob = get_cur_player();
	if(ob!=me)
		return notify_fail("还没有到你猜了。\n");

	if(!arg||sscanf(arg,"%d %d",n,p)!=2)
		return notify_fail("guess 色子数目 色子点数\n");

	if(n<sizeof(player)||p>6||p<=0)
		return notify_fail(sprintf("色子数目必须>=%d，色子点数必须>0并且<=6\n",sizeof(player)));

	ok = 1;
	if(last_player)
	{
		if(n>cur_amount)
			ok = 1;
		else
		{
			if(n==cur_amount)
			{
				if(p>cur_point)
					ok = 1;
				else
					ok = 0;
			}
			else
				ok = 0;
		}
	}
	if(!ok)
		return notify_fail("色子数目或者色子点数必须比前一位玩家大。\n");

	last_player = me->query("id");
	cur_amount = n;
	cur_point = p;
	if(p==1)has_guess_one = 1;

	cur_player = player_follow[last_player];

	msg(me,0,sprintf("$N(%s)说道：%d个%d\n",me->query("id"),n,p));
	if(history)
		history = history + ({ sprintf("%-20s：%d个%d",me->query("name")+"("+me->query("id")+")",n,p) });
	else
		history = ({ sprintf("%-20s：%d个%d",me->query("name")+"("+me->query("id")+")",n,p) });

	do_next("");
	return 1;
}

void add_counter(string who,int number)
{
	counter[who] = counter[who]+number;
}

int show_all_se(object who)
{
	string* idx;
	mixed* s;
	int i,j,p,sc,pt;
	object ob;

	int c;
	string m,o;

	if(!last_player)return 0;
	ob = get_player(last_player);
	if(!ob||!who)return 0;

	has_guess = 0;
	
	idx = keys(player);
	c = 0;
	m = "";
	for(i=0;i<sizeof(idx);i++)
	{
		if(get_player(idx[i]))
		{
			s = player[idx[i]];
			m = sprintf("%s%12s：",m,idx[i]);
			o = "";
			sc = 0;
			for(j=0;j<se_num;j++)
			{
				m = sprintf("%s%d",m,s[j]);
				p = s[j];
				if(p==1&&!has_guess_one)p = cur_point;
				if(p==cur_point)
				{
					c ++;
					sc ++;
					o = sprintf("%s%d",o,s[j]);
				}
			}
			if(sc==se_num)
			{
				o = o + " 围色+1";
				c++;
			}
			m = m + "||"+o+"\n";
		}
	}
	m = sprintf("%s%s猜有"HIC"%d"NOR"个%d，",m,ob->query("name"),cur_amount,cur_point);
	m = sprintf("%s现在有"HIC"%d"NOR"个%d\n\n",m,c,cur_point);
	msg(0,0,m);

	if(who->query("id")==cur_player)
		pt = 1;
	else
		pt = 2;

	if(c<cur_amount)
	{
		add_counter(who->query("id"), pt);
		add_counter(ob->query("id"), -pt);
		msg(ob,who,BLINK HIY "$N被$n拆穿了大话！！！\n\n" NOR);
		who_lost = last_player;
	}
	else
	{
		add_counter(who->query("id"), -pt);
		add_counter(ob->query("id"), pt);
		msg(who,0,BLINK HIY "$N判断错误了！！！\n\n" NOR);
		who_lost = who->query("id");
	}
	start_game(0);
}

int do_dahua(string arg)
{
	object ob;
	object me;
	
	me = this_player();

	if(!arg)
	{
		msg(me,0,"$N一扁嘴嘟囔道：“大话精，大话精...”\n");
		return 1;
	}

	if(!is_playing(me))
		return notify_fail("你都不玩啊！\n");

	if(!has_guess||!last_player)
		return notify_fail("还没有开始猜色子了。\n");
	
	ob = get_player(last_player);
	if(ob==me)
		return notify_fail("自己不相信自己。\n");

	if(last_player!=arg)
		return notify_fail("不是他最后猜色子了。\n");

	msg(me,ob,HIC "\n$N对$n说道：我不相信！！！\n" NOR);
	show_all_se(me);
	return 1;
}

int do_finish(string arg)
{
	object me,ob;

	me = this_player();
	if(!is_playing(me))
		return notify_fail("你都不玩啊！\n");
	if(!has_start)
		return notify_fail("游戏还没有开始了。\n");
	if(has_guess)
		return notify_fail("已经开始猜色子了。\n");

	player_deal[me->query("id")] = 1;
	msg(me,0,"$N准备好了。\n");
	if(sizeof(player_deal)==sizeof(player))
	{
		// all is finish
		has_guess = 1;
		msg(0,0,"\n猜色子开始\n");
		if(who_lost)cur_player = who_lost;
		who_lost = 0;
		if(!cur_player)cur_player = me->query("id");
		if(ob = get_cur_player())
		{
			msg(ob,0,"$N说道：由我先猜！！！\n");
			tell_object(ob,for_guess_msg());
		}
		else
			msg(0,0,"缺少了"+cur_player+"，不能进行游戏，请重新开始(start)\n");
	}
	
	return 1;
}

int do_history(string arg)
{
	if(!history)
		tell_object(this_player(),"没有历史资料。\n");
	else
		tell_object(this_player(),implode(history,"\n")+"\n");
	return 1;
}

int do_showc(string arg)
{
	string r;
	string* idx;
	int i;

             if(!counter) return 0; 

	idx = keys(player);
	
	r = "计数表(Scoreboard)\n－－－－－－－－－－－－－－－－－\nID　　　　　　　　分数\n－－－－－－－－－－－－－－－－－\n";
	for(i=0;i<sizeof(idx);i++)
	{
		if(get_player(idx[i]))
			r = sprintf("%s%-14s%10d\n", r,idx[i],counter[idx[i]]);
	}
	r += "－－－－－－－－－－－－－－－－－\n";

	msg(0,0,r);
	return 1;
}

int do_visitor(string arg)
{
	string key;
	object me,ob;
	int del;

	if(!arg)
		return notify_fail("visit [-d] 玩家ID\n");

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
				return notify_fail("不是你的观战者。\n");

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

int do_help(string arg)
{
	this_player()->start_more( @HELP
大话色使用方法:
——[开始游戏]———————————————
帮助命令：helpse
加入命令：join　　　　　加入游戏
开始命令：start 　　　　开始游戏
重置命令：reset se		结束游戏

——[游戏前命令]———————————————
　摇色子：toss
查看色子：view [玩家ID]
准备结束：finish 或者 deal

——[游戏命令]———————————————
拆穿大话：dahua 玩家ID
猜测色子：guess 色子数量 色子点数
　　　　　或者 g 色子数量 色子点数
催促玩家：next

——[其它命令]———————————————
　计数器：showc
猜测日志：history

——[旁观命令]———————————————
观战命令：visit [-d] 玩家ID
		邀请其它玩家观看你的游戏。
		加参数 -d 表示删除该玩家的观看资格。

——[游戏规则]———————————————
建设中...

——————————————————————
			make by 猫部猫(Catyboy) v1.0
HELP
	);
        return 1;
}
