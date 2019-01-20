// pai21.c 21点牌
// make by 猫部猫(Catyboy)

#include <ansi.h>
#define MAX_PAI  52

inherit ITEM;

int has_start;
mapping player;			// 玩家ID
mapping player_data;

// 参数
int game_start;			// 1局是否开始?
string who_play;		// 正在出牌的人

// 牌容器
int remain;				// 所剩的牌数量
mixed pai_on_desk;		// 可以使用的牌		
mapping player_hand;	// 玩家手上的牌

// 计数器
mapping counter = ([]);

string *suit_str = ({  WHT"方块"NOR , HIB"梅花"NOR ,HIR"红桃"NOR , HBWHT BLK"黑桃"NOR});
string *suit_char = ({ "D","C","H","S"});
string *rank_str = ({ "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" });

int pai_number(int pai);
int pai_color(int pai);
object get_player(string id);
int is_playing(object ob);
int sizeof_pai(mixed* p);
void restore_player_data();
int pick_out();
int pick_in(string to, int card);
string id_to_pai(int id);
int do_pass(string arg);
int do_nextone(string arg);
string view_pai(string which);
void finish_21();
int auto_order();

void msg(object me,object who,string msg)
{
	if(me)
		message_vision(msg,me,who);
	else
		tell_room(environment(this_object()),msg,0);
}

int c21(mixed* inv)
{
	int i,j,sum,temp;

	sum = 0;
	temp = 0;
	for(i=0;i<inv[0];i++)
	{
		j = pai_number(inv[i+1]);
		if(j == 14)
		{
			temp ++;
			j = 11;
		}
		else
			j = (j>10?10:j);
		sum+=j;
	}
			
	for(;sum>21&&temp>0;temp--)
		sum -= 10;

	return sum;
}

void reset_pai()
{
	// 重置牌（牌盒，玩家的牌)
	int i;
	string* key;
	
	for(i=0;i<MAX_PAI;i++)
		pai_on_desk[i]=i;
	remain=MAX_PAI;

	key = keys(player);
	for(i=0;i<sizeof(key);i++)
		player_hand[key[i]]=allocate(MAX_PAI);

	who_play = 0;
}

int reset_all()
{
	// 重置整个游戏
//	int i;

	has_start = 0;
	if(sizeof(player)!=0)
		msg(this_player(),0,"$N重新置牌了。\n");
	
	player = ([]);
	player_hand = ([]);

	pai_on_desk = allocate(MAX_PAI);
	reset_pai();
	counter = ([]);

	return 1;
}

void create()
{
	set_name("21点牌桌", ({"card desk","pai","pai21"}));
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "一张桌子，上面放着一些牌，使用方法请使用(helppai)命令。\n");
		set("unit", "张");
		set("value", 1);
	}
	player = ([]);
	reset_all();
}

void init()
{
	// 帮助
	add_action("do_help", "helppai");

	// 基本指令
    add_action("do_reset", "reset");		// 重置整个游戏
	add_action("do_restart", "restart");	// 重新游戏
	add_action("do_join", "join");			// 加入牌局
	add_action("do_start", "start");		// 开始游戏
	
	add_action("do_xipai", "xipai");		// 洗牌
	add_action("do_view", "view");			// 看牌
		
	add_action("do_nextone", "next");		// 催促下一个
	add_action("do_pass", "pass");			// 不要牌
	
	// 扩展指令
	add_action("do_chupai", "play");		// 玩
	add_action("do_daopai", "daopai");		// 倒牌

	// 计数器
	add_action("do_showc", "showc");		// 显示计数器
}

int do_reset(string arg)
{
	if(arg == "counter")
	{
		if(!is_playing(this_player()))
			return notify_fail("你都不玩牌啊！\n");

		msg(this_player(),0,"$N复位计数器了。\n");
		counter = ([]);
		return 1;
	}
	if(!this_object()->id(arg))
		return 0;
		
	return reset_all();
}

int do_restart(string arg)
{
//	int i;
//	string* key;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩，开始什么啊！\n");

	if(!has_start)
		return notify_fail("游戏还没有开始。\n");

	if(sizeof(player)!=0)
		msg(this_player(),0,"$N开始新的一轮牌局了。\n\n");

	reset_pai();
	restore_player_data();
	msg(0,0,"在开始游戏之前(play)，请各位洗牌(xipai)。\n");
	return 1;
}

int do_join(string arg)
{
	object me;

	me = this_player();
	if(has_start)
		return notify_fail("牌局已经开始，不能加入了。\n");
	if(is_playing(me))
		return notify_fail("你已经参加了。\n");
	
	// add player
	player[me->query("id")]="yes";
	player_hand[me->query("id")]=allocate(MAX_PAI);
	msg(me,0,"$N加入牌局了。\n");
	return 1;
}

int do_start(string arg)
{
	if(!is_playing(this_player()))
		return notify_fail("你都不玩，开始什么啊！\n");
	
	if(has_start)
		return notify_fail("牌局已经开始了。\n");

	has_start = 1;
	msg(this_player(),0,"$N开始了牌局。\n\n");
	auto_order();
	msg(0,0,"在开始游戏之前(play)，请各位洗牌(xipai)。\n");
	return 1;
}

int do_xipai(string arg)
{
	int i,sum,rand,which,temp;
	mixed* pai;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩，洗什么牌啊！\n");
	
	pai = pai_on_desk;
	sum = remain;
	rand = sum;
	
	for(i=0;i<sum;i++)
	{
		which = random(rand);
		temp = pai[rand-1];
		pai[rand-1] = pai[which];
		pai[which] = temp;
		rand --;
	}
	msg(this_player(),0,"$N洗了洗桌面的牌。\n");
	return 1;
}

int do_chupai(string arg)
{
	int /*i,*/sum/*,j*/,done/*,temp*/,id;
	mixed* inv;
//	string cmd;
	object ob;
		
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(who_play==0)
		who_play = this_player()->query("id");

	if(who_play!=this_player()->query("id"))
		return notify_fail("还没有轮到到你啊。\n");

	done = 0;
		
	if((id = pick_out())==-1)
		return 0;

	if(!pick_in(this_player()->query("id"),id))
		return 0;

	msg(this_player(),0,"$N摸了一张"+id_to_pai(id)+"。\n");

	done = 1;

	// check is over 21,if over pass
	inv = player_hand[this_player()->query("id")];
	sum = c21(inv);
			
	msg(this_player(),0,"$N手上有"HIY+sum+"点"NOR"了。\n");
	if(sum>21)
	{
		do_pass(HIR"爆了！！！"NOR"\n");
		return 1;
	}
	
	ob = get_player(player[who_play]);
	if(ob)
	{
		who_play = player[who_play];
		do_nextone("");
	}
	return 1;
}

int do_view(string arg)
{
	mixed* pai;
	string hand_name;

	if(arg==""||arg==0)
		arg = this_player()->query("id");
	else
		hand_name = arg;
	
	pai = player_hand[arg];
	if(pai==0)
		return notify_fail("牌局没有这个玩家。\n");
	
	if(hand_name)
		write(hand_name+"：");
	write(view_pai(arg)+"\n");
	return 1;
}

string extra_long()
{
	object me,who;
	string r,key;
	mixed *idx;
	int i;

	me = this_player();
	idx = keys(player);
	
	r = sprintf("牌盒里面有%d张牌\n",remain);
	
	if(sizeof(player)>0)
	{
		r+="******************************************\n";
		for(i=0;i<sizeof(idx);i++)
		{
			key = idx[i];
			who = get_player(key);
			if(who)
				r = r + key + "："+view_pai(key)+"\n";
		}
		r = r + "******************************************\n";
	}
	return r;
}

int pick_out()
{
	int s,id;
		
	if(remain>0)
	{
		remain--;
		s = remain;
		id = pai_on_desk[s];
		pai_on_desk[s]=-1;
		return id;
	}
	else
	{
		msg(0,0,"没有牌了");
		return -1;
	}
}

int pick_in(string to, int card)
{
	int s;
	mixed* pai;
		
	pai = player_hand[to];
	s = pai[0];
	s++;
	pai[s]=card;
	pai[0]++;
	return 1;
}

object get_player(string id)
{
	if(stringp(player[id]))
		return find_player(id);
	return 0;
}

int is_playing(object ob)
{
//	int i;
	string id;
	id = ob->query("id");
	if(stringp(player[id]))
		return 1;
	return 0;
}

int sizeof_pai(mixed* p)
{	
	return p==0?0:p[0];
}

string view_pai(string which)
{
	mixed* pai;
	int /*show_all,*/i/*,j*/;
	string s,p;

	pai = player_hand[which];

	if(pai==0)
		return 0;
 
	if(sizeof_pai(pai)==0)
		return "没有牌";

	s = "";
	for(i=0;i<pai[0];i++)
	{
		p = id_to_pai(pai[i+1]);
		s+= p +" ";
	}
	return sprintf("%s：%d点",s,c21(pai));
}

int do_nextone(string arg)
{
	object ob;
	string id;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩牌啊！\n");

	if(who_play==0)
		return notify_fail("现在是谁出牌啊？\n");

	id = who_play;
	ob = get_player(id);
	
	if(ob==0)
		return msg(0,0,"有玩家缺场了，请重新开始游戏(reset pai)。\n");

	if(this_player()->query("id")!=id)
		msg(this_player(),ob,"$N对$n说道：到你了。\n");
	else
		msg(this_player(),0,"对自己说道：到我啦！\n");
	return 1;
}

int do_pass(string arg)
{
	string old/*,str*/;
	string* key;
//	mixed* inv;
	int i/*,temp*/;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩牌啊！\n");

	if(who_play!=this_player()->query("id"))
		return notify_fail("还没有到你啊！\n");

	if(!arg)
		arg = "ＰＡＳＳ！！";
	msg(this_player(),0,"$N说道："+arg+"\n");
	old = who_play;
	who_play = player[who_play];

	key = keys(player);

	for(i=0;i<sizeof(key);i++)
		if(player[key[i]]==old)
			player[key[i]] = player[old];
	player[old] = "";
				
	if(player[who_play] == "")
	{
		msg(0,0,"大家都不要了。\n");
		finish_21();
		return 1;
	}
	do_nextone("");
	return 1;
}

string id_to_pai(int id)
{
	int i,j;
	if(id <0)
		return HIR"???"NOR;
	if(id == 52)
		return HIY"小鬼"NOR + "JS";
	if(id>=53)
		return HIY"大鬼"NOR + "JB";
	i = id/13;
	j = id-i*13;
	return suit_str[i] + suit_char[i] + rank_str[j];
}

int pai_to_id(string id)
{
	int ic1=-1,ic2=-1;
	string c1,c2;
	c1 = id[0..0];
	c2 = id[1..sizeof(id)-1];

	if(c1=="J")return c2=="S"?52:53;
	if(c1==suit_char[0]) ic1=0;
	if(c1==suit_char[1]) ic1=1;
	if(c1==suit_char[2]) ic1=2;
	if(c1==suit_char[3]) ic1=3;
	if(ic1==-1)return -1;

	if(sscanf(c2,"%d",ic2)!=1)
	{
		if(c2 == "J") ic2 = 11;
		if(c2 == "Q") ic2 = 12;
		if(c2 == "K") ic2 = 13;
		if(c2 == "A") ic2 = 14;
		if(ic2==-1) return -2;
	}
	ic2 -=2;
	return ic1*13+ic2;
}

int auto_order()
{
	int i;
	string* key;
	string who,start_one;

	key = keys(player);

	start_one = key[0];
	who = "";
	for(i=0;i<sizeof(key);i++)
	{
		if(get_player(key[i]))
		{
			if(who =="")
				who = key[i];
			else
			{
				player[who] = key[i];
				who = key[i];
			}
		}
	}
	player[who] = start_one;
	return 1;
}

int do_showc(string arg)
{
	string r;
	mixed *idx;
	int i;

	idx = keys(counter);
	
	r = "计数表(Scoreboard)\n－－－－－－－－－－－－－－－－－\nID　　　　　　　　分数\n－－－－－－－－－－－－－－－－－\n";
	for(i=0;i<sizeof(idx);i++)
		r = sprintf("%s%-14s%10d\n", r,idx[i],counter[idx[i]]);
	r += "－－－－－－－－－－－－－－－－－\n";

	msg(0,0,r);
	return 1;
}

void press_counter(string id,int num)
{
	counter[id]=counter[id]+num;
}

int do_daopai(string arg)
{
	int i,id;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩，搞什么啊！\n");

	if(!has_start)
		return notify_fail("游戏还没有开始。\n");

	if(remain>0)
	{
		id = pai_on_desk[0];
		for(i=1;i<remain;i++)
			pai_on_desk[i-1] = pai_on_desk[i];
		pai_on_desk[remain-1] = id;
		msg(this_player(),0,"$N倒了一下牌。\n");
		return 1;
	}
	else
		return notify_fail("没有牌了。\n");
}

int pai_number(int pai)
{
	if(pai==52)
		return 15;
	if(pai==53)
		return 16;
	return pai-pai/13*13+2;
}

int pai_color(int pai)
{
	if(pai>=52)
		return 5;
	return pai/13+1;
}

void save_player_data()
{
	string* inv;
	int i;
	inv = keys(player);
	player_data = ([]);
	for(i=0;i<sizeof(inv);i++)
		player_data[inv[i]] = player[inv[i]];
}

void restore_player_data()
{
	int i;
	string* key;

	if(!player_data)
		return;

	key = keys(player_data);
	for(i=0;i<sizeof(key);i++)
		player[key[i]] = player_data[key[i]];
}

int sort_21(string str1, string str2)
{
	int c1,c2;
	string temp;

	sscanf(str1,"%s:%d",temp,c1);
	sscanf(str2,"%s:%d",temp,c2);
	
	if(c1==c2)
		return 0;

	if(c1>21&&c2>21)
		return (c1<c2)?-1:1;

	if(c1>21)
		c1 = -1;
	if(c2>21)
		c2 = -1;
	return (c1>c2)?-1:1;
}

void finish_21()
{
	string* key;
	mixed* inv2;
	mixed* inv;
	string str,r,id;
	int i,maxn,fen,k,lpoint;

	key = keys(player);
	inv2 = allocate(sizeof(player));
	for(i=0;i<sizeof(key);i++)
	{
		str = key[i];
		inv2[i] = str + ":" + c21(player_hand[str]);
	}
		
	inv = sort_array(inv2,"sort_21",this_object());
	
	lpoint = -1;
	r = "结果\n－－－－－－－－－－－－－－－－－\nID　　　　　　　　点数       得分\n－－－－－－－－－－－－－－－－－\n";
	for(i=0;i<sizeof(inv);i++)
	{
		sscanf(inv[i],"%s:%d",id,k);
		if(k != lpoint)
		{
			fen = sizeof(inv) - i - 1;
			lpoint = k;
		}
		if(i==0)maxn=k;
		if(k==maxn)r+=HIY;
		if(k>21)
		{
			r+=HIR;
			fen = 0;
		}
		r = sprintf("%s%-14s%5d%12d\n", r,id,k,fen);
		r+=NOR;

		press_counter(id,fen);
	}
	r += "－－－－－－－－－－－－－－－－－\n\n";
	msg(0,0,r);
	
	reset_pai();
	restore_player_data();
	msg(0,0,"请各位重新洗牌(xipai)开始新的一局。\n");
}

int do_help(string arg)
{
	this_player()->start_more( @HELP
玩21点牌桌使用方法:
——[开始游戏]———————————————
帮助命令：helppai
加入命令：join　　　　　加入游戏
开始命令：start 　　　　开始以后不能再加入
重置命令：reset pai 　　结束游戏

——[游戏命令]———————————————
重新游戏：restart
　　摸牌：play　　　　　进行游戏
不再要牌: pass

——[其它命令]———————————————
洗牌命令：xipai
看牌命令：view [玩家ID] 观察玩家手上的牌
催促命令：next　　　　　催促正在出牌的人

——[计数牌使用]——————————————
显示: showc
重置: reset counter




——[游戏规则]———————————————
游戏开始以后，每人轮流摸牌直到不摸为止。
最后根据每人手上的点数决定胜负。
点数 > 21 为输，点数<21的时候点数大者胜。
J，Q，k为10点，A可以为1点或者为11点。

——————————————————————
			make by 猫部猫(Catyboy) v1.0
HELP
	);
        return 1;
}

mixed t()
{
	return pai_on_desk;
}