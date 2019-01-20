// pai.c 牌
// make by 猫部猫(Catyboy)

#include <ansi.h>
#define DESK  "desk"
#define DESK2 "desk2"
#define PAIS  55

inherit ITEM;

int has_start;
mapping player;			// 玩家ID
mapping player_data;	// 玩家资料 21点

// 模式
string mode;			// 8,21,D2
string mode2;			// auto,man
int game_start;			// 1局是否开始?
int player_counter;		// 计数器 8
string who_play;		// 正在出牌的人 21
string last_play;		// 最后一个出牌的人
mixed last_pai;			// 最后出的牌


// 牌容器
mixed expai;				// 不使用的的牌 id = desk
mixed allpai;				// 使用的牌		id = desk2
mapping pai_hand;			// 玩家手上的牌	id = playerid+" hand"
mapping pai_out;			// 玩家出的牌	id = playerid+" out"
mapping pai_save;			// 玩家保存的牌 id = playerid+" save"
mapping pai_hide;			// 玩家隐藏的牌 id = playerid+" hide"

// 计数器
mapping counter = ([]);

string *suit_str = ({  WHT"方块"NOR , HIB"梅花"NOR ,HIR"红桃"NOR , HBWHT BLK"黑桃"NOR});
string *suit_char = ({ "D","C","H","S"});
string *rank_str = ({ "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" });

void save_player_data();
void restore_player_data();
void finish_21();
int pai_number(int pai);
int pai_color(int pai);
int do_reset(string arg);
int do_shunxu(string arg);
int do_nextone(string arg);
int do_xipai(string arg);
int do_paipai(string arg);
int do_pass(string arg);
int pick_out(string from, int id);
int pick_out2(string from, int id);
int pick_in(string to,int card);
string id_to_name(string id);
mixed* get_pais(string id);
object get_player(string id);
int is_playing(object ob);
int move_pai(string pid,string from,string to);
int sizeof_pai(mixed* p);
string view_pai(object who,string which);
int do_movepai(string arg);
string id_to_pai(int id);
int pai_to_id(string id);
void msg(string msg);

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

string mode_name()
{
	if(mode=="8")
		return "8张";
	if(mode=="21")
		return "21点";
	return "不明模式";
}

void reset_pai()
{
	int i;
	string* key;
	
	for(i=0;i<54;i++)
		allpai[i+1]=i;
	allpai[0]=54;

	for(i=0;i<expai[0];i++)
		pick_out("desk",expai[i+1]);

	key = keys(player);
	for(i=0;i<sizeof(key);i++)
	{
		pai_hand[key[i]]=allocate(PAIS);
		pai_out[key[i]]=allocate(PAIS);
		pai_save[key[i]]=allocate(PAIS);
		pai_hide[key[i]]=allocate(PAIS);
	}

	who_play = 0;
	last_play = 0;
	last_pai = ( {-1,-1,-1,-1,-1} );
}

int reset_all()
{
//	int i;

	has_start = 0;
	if(sizeof(player)!=0)
		msg(this_player()->name()+"重新置牌了。\n");
	
	player = ([]);
	player_data = ([]);
	pai_hand = ([]);
	pai_out = ([]);
	pai_save = ([]);
	pai_hide = ([]);

	allpai = allocate(PAIS);
	expai = allocate(PAIS);
	expai[0]=0;

	reset_pai();

	// reset mode
	mode = 0;
	mode2 = 0;

	return 1;	
}

void create()
{
	set_name("牌桌", ({"card desk","pai"}));
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "一张桌子，上面放着一些牌，使用方法请使用(helppai)命令。\n");
		set("unit", "张");
		set("value", 1);
                set("no_get", 1);
	}
	player = ([]);
	
	reset_all();
}

void init()
{
	// 帮助
	add_action("do_help", "helppai");
	add_action("do_help2", "helppai2");

	// 基本指令
    add_action("do_reset", "reset");
	add_action("do_restart", "restart");
	add_action("do_join", "join");
	add_action("do_start", "start");
	add_action("do_xipai", "xipai");
	add_action("do_view", "view");
	add_action("do_sortpai", "sort");
	add_action("do_movepai", "move");
	add_action("do_shunxu", "order");
	add_action("do_now", "now");
	add_action("do_nextone", "next");
	add_action("do_pass", "pass");
	add_action("do_end", "finish");
	add_action("do_setmode", "setmode");

	// 扩展指令
	add_action("do_paipai", "pai");
	add_action("do_paipai2", "paipai");
	add_action("do_mopai", "mopai");
	add_action("do_chupai", "play");
	add_action("do_showpai", "show");
	add_action("do_hidepai", "hide");
	add_action("do_takebackpai", "takeback");
	add_action("do_removej", "removej");
	add_action("do_daopai", "daopai");

	// 计数器
	add_action("do_press", "press");
	add_action("do_showc", "showc");
	add_action("do_removec", "removec");
}

int do_help(string arg)
{
	this_player()->start_more( read_file(__DIR__ "helppai"));
	write("\n");
	return 1;
}

int do_help2(string arg)
{
	if(!arg)return 0;
	if(file_size(__DIR__ ""+arg+"_hlp")<0)return 0;
	this_player()->start_more( read_file(__DIR__ ""+arg+"_hlp"));
	write("\n");
	return 1;
}

int do_reset(string arg)
{
	if(arg == "counter")
	{
		if(!is_playing(this_player()))
			return notify_fail("你都不玩牌啊！\n");

		write("计数器复位了。\n");
		counter = ([]);
		return 1;
	}
	if(!this_object()->id(arg))return 0;
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
		msg("重新开始了。\n");
	
	reset_pai();

	if(mode == "8")
	{
		player_counter = 0;
		restore_player_data();
	}

	if(mode == "21")
		restore_player_data();
	
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
	pai_hand[me->query("id")]=allocate(PAIS);
	pai_out[me->query("id")]=allocate(PAIS);
	pai_save[me->query("id")]=allocate(PAIS);
	pai_hide[me->query("id")]=allocate(PAIS);
	msg(me->name()+"加入牌局了。\n");
	return 1;
}

int do_start(string arg)
{
	if(!is_playing(this_player()))
		return notify_fail("你都不玩，开始什么啊！\n");
	has_start = 1;
	msg(this_player()->name()+"开始了牌局。\n");

	this_player()->start_more( read_file(__DIR__ "startpai"));
	write("\n");
	return 1;
}

int do_xipai(string arg)
{
	int i,sum,rand,which,temp;
	mixed* pai;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩，洗什么牌啊！\n");

	if(arg==""||arg==0)
		arg = DESK;
	
	pai = get_pais(arg);
	if(pai==0)
		return notify_fail("没有这种牌，请参阅帮助。\n");
	
	sum = pai[0];
	rand = sum;
	
	for(i=0;i<sum;i++)
	{
		which = random(rand)+1;
		temp = pai[rand];
		pai[rand] = pai[which];
		pai[which] = temp;
		rand --;
	}
	msg(this_player()->name()+"洗了洗"+id_to_name(arg)+"的牌。\n");
	return 1;
}

int do_sortpai(string arg)
{
	int i,sum/*,which*/,v=0,j,it;
	int c1,c2;
	string temp;
	mixed* pai;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩，整理什么牌啊！\n");

	if(arg==""||arg==0)
		arg = this_player()->query("id")+" hand";
	if(arg=="/c")
		arg = this_player()->query("id")+" hand /c";

	if(sscanf(arg,"%s /c",temp)==1)
	{
		v = 1;		// 以色整理
		arg = temp;
	}

	pai = get_pais(arg);
	if(pai==0)
		return notify_fail("没有这种牌，请参阅帮助。\n");
	
	sum = pai[0];
	
	for(i=0;i<sum;i++)
	{
		for(j=0;j<sum;j++)
		{
			if(i==j)continue;
			if(v)
			{
				c1=pai[i+1];
				c2=pai[j+1];
			}
			else
			{
				c1 = pai[i+1]>=52?pai[i+1]:(pai[i+1]-pai[i+1]/13*13)*4+pai[i+1]/13;
				c2 = pai[j+1]>=52?pai[j+1]:(pai[j+1]-pai[j+1]/13*13)*4+pai[j+1]/13;
			}
			
			if(c1<c2)
			{
				it=pai[i+1];
				pai[i+1]=pai[j+1];
				pai[j+1]=it;
			}
		}
	}

	msg(this_player()->name()+"整理了一下"+id_to_name(arg)+"的牌。\n");
	return 1;
}

int do_movepai(string arg)
{
	int i,wi,v = 1,op;
	string* whichs;
	string which,where1,where2,temp,pstr,err;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(arg==""||arg==0)
		return notify_fail("格式：move which[+which2...] from where1 to where2 [/h]\n");

	if(sscanf(arg,"%s from %s to %s",which,where1,where2)!=3)
		return notify_fail("格式：move which from where1 to where2 [/h]\n");

	if(sscanf(where2,"%s /h",temp)==1)
	{
		where2 = temp;
		v = 0;
	}

	if(where1=="hand"||
		where1=="out"||
		where1=="save"||
		where1=="hide")
		where1 = this_player()->query("id")+" "+where1;
	if(where2=="hand"||
		where2=="out"||
		where2=="save"||
		where2=="hide")
		where2 = this_player()->query("id")+" "+where2;
	
	if(get_pais(where2)==0)
		return notify_fail("目的错误，请参阅帮助。\n");

	whichs = explode(which,"+");
	pstr = "";
	op = 0;
	err = "";
	for(i=0;i<sizeof(whichs);i++)
	{
		temp = whichs[i];
		if(sscanf(temp,"%d",wi)==1)
			wi = pick_out2(where1,wi);
		else
		{
			if(where1=="desk"&&has_start)
				return notify_fail("已经开始了，不能移动指定的牌。\n");
			wi=pick_out(where1,pai_to_id(temp));
		}

		if(wi==-1)
		{
			err = "源或者牌号/序号错误，请参阅帮助。\n";
			continue;
		}

		if(!pick_in(where2,wi))
		{
			err = "移动牌错误。\n";
			continue;
		}
		if(pstr!="")
			pstr += " ";
		pstr+= id_to_pai(wi);
		op ++;
		// if(i<5)
		//	last_pai[i]=wi;
	}
	
	if(!v)
		pstr =  chinese_number(op) +"张牌";
	
	if(op>0)
		msg(this_player()->name()+"把"+pstr+"从"+id_to_name(where1)+"放到"+id_to_name(where2)+"。\n");
	return err==""?1:notify_fail(err);
}

int do_paipai(string arg)
{
	int i,sum,j;
	string* key;
//	string cmd;
	

	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(!has_start)
		return notify_fail("还没有开始就派牌？\n");
	
	if(arg==0||sscanf(arg,"%d",sum)!=1)
		sum = 100;

	key = keys(player);
	for(i=0;i<sum;i++)
	{
		if(sizeof_pai(allpai)==0)
			return 1;
		for(j=0;j<sizeof(key);j++)
			do_movepai("1 from desk to "+key[j]+" hand /h");
	}
	return 1;
}

int do_mopai(string arg)
{
//	int i,sum,j;
//	string* key;
//	string cmd;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	return do_movepai("1 from desk to "+this_player()->query("id")+" hand /h");
}

int do_chupai(string arg)
{
	int /*i,*/sum/*,j*/,done/*,temp*/;
	mixed* inv;
//	string cmd;
	object ob;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(mode == "21")
	{

	}
	else
	{
		if(arg==0)
			return notify_fail("格式：play which[+which2...]\n");
	}

	if(mode == "8")
		return notify_fail("使用hide命令摆牌\n");

	if(who_play==0)
		who_play = this_player()->query("id");

	if(who_play!=this_player()->query("id"))
		return notify_fail("还没有轮到到你啊。\n");

	done = 0;
		
	if(mode == "21")
		if(do_movepai("1 from desk to out"))
		{
			done = 1;
			// check is over 21,if  over pass
			inv = get_pais(this_player()->query("id")+" out");
			sum = c21(inv);
				
			msg(this_player()->name()+"手上有"HIY+sum+"点"NOR"了。\n");
			if(sum>21)
			{
				do_pass(HIR"爆了！！！"NOR"\n");
				return 1;
			}
		}

	if(done==0)
		done = do_movepai(arg+" from hand to out");
		
	if(done)
	{
		ob = get_player(player[who_play]);
		if(ob)
		{
			who_play = player[who_play];
			do_nextone("");
			// tell_object(ob,"你的牌是:\n"+view_pai(ob,who_play+" hand")+"\n");
		}
	}
	return 1;
}

int do_showpai(string arg)
{
//	int i,sum,j;
//	string* key;
//	string cmd;
//	object ob;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(arg==0)
		return notify_fail("格式：show which[+which2...]\n");

	if(who_play==0)
		who_play = this_player()->query("id");

	do_movepai(arg+" from hand to save");
	return 1;
}

int do_hidepai(string arg)
{
//	int i,sum,j;
//	string* key;
//	string cmd;
//	object ob;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(arg==0)
		return notify_fail("格式：hide which[+which2...]\n");

	if(who_play==0)
		who_play = this_player()->query("id");

	do_movepai(arg+" from hand to hide /h");
	return 1;
}

int do_takebackpai(string arg)
{
//	int i,sum,j;
//	string* key;
	string cmd,where;
//	object ob;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(arg==0)
		return notify_fail("格式：takeback which[+which2...] [from where]\n");

	if(sscanf(arg,"%s from %s",cmd,where)!=2)
	{
		cmd = arg;
		where = "out";
	}

	do_movepai(cmd+" from "+where+" to hand"+(where=="hide"?" /h":""));
	return 1;
}

int do_view(string arg)
{
	mixed* pai;

	if(arg==""||arg==0)
		arg = this_player()->query("id")+" hand";

	if(arg=="hand"||
		arg=="out"||
		arg=="save"||
		arg=="hide")
		arg= this_player()->query("id")+" "+arg;
	
	pai = get_pais(arg);
	if(pai==0)
		return notify_fail("没有这种牌，请参阅帮助。\n");
	
	write(id_to_name(arg)+":"+view_pai(this_player(),arg)+"\n");
	return 1;
}

string extra_long()
{
	object me;
	string r,key;
	mixed *idx;
	int i;

	me = this_player();
	idx = keys(player);
	
	r = id_to_name(DESK) + ":" + view_pai(me,DESK)+"\n";
	r = r + id_to_name(DESK2) + ":" + view_pai(me,DESK2)+"\n";

	r+= "****";
	if(mode&&mode!="")
		r+= mode_name();
	r+="******************************************\n";
	for(i=0;i<sizeof(idx);i++)
	{
		key = idx[i];
		r = r + id_to_name(key+" hand") + ":"+view_pai(this_player(),key+" hand")+"\n";
		r = r + id_to_name(key+" out") + ":"+view_pai(this_player(),key+" out")+"\n";
		r = r + id_to_name(key+" save") + ":"+view_pai(this_player(),key+" save")+"\n";
		r = r + id_to_name(key+" hide") + ":"+view_pai(this_player(),key+" hide")+"\n";
		r = r + "**********************************************\n";
	}
	
	return r;
}

int pick_out(string from, int id)
{
	int i,j,s;
//	string* p;
	mixed* pai;
		
	pai = get_pais(from);
	if(pai==0)
		return -1;
	
	s = pai[0];

	for(i=0;i<s;i++)
	{
		if(pai[i+1]==id)
		{
			// move all next
			for(j=i+1;j<s;j++)
				pai[j]=pai[j+1];
			pai[s]=-1;
			pai[0]--;
			return id;
		}
	}
	return -1;
}

int pick_out2(string from, int id)
{
	int i,j,s;
//	string* p;
	mixed* pai;
		
	pai = get_pais(from);
	if(pai==0)
		return -1;
	
	s = pai[0];

	for(i=0;i<s;i++)
	{
		if(i+1==id)
		{
			id = pai[i+1];
			// move all next
			for(j=i+1;j<s;j++)
				pai[j]=pai[j+1];
			pai[s]=-1;
			pai[0]--;
			return id;
		}
	}
	return -1;
}

int pick_in(string to, int card)
{
	int s;
	mixed* pai;
		
	pai = get_pais(to);
	if(pai==0)
		return 0;
	s = pai[0];
	s++;
	if(s>54)
		return 0;
	pai[s]=card;
	pai[0]++;
	return 1;
}

mixed* get_pais(string id)		// 获取指定ID的牌
{
	string str;

	if(id == DESK)
		return allpai;
	if(id == DESK2)
		return expai;

	if(sscanf(id,"%s hand",str)==1)
	{
		if(get_player(str))
			return pai_hand[str];
	}

	if(sscanf(id,"%s out",str)==1)
	{
		if(get_player(str))
			return pai_out[str];
	}

	if(sscanf(id,"%s save",str)==1)
	{
		if(get_player(str))
			return pai_save[str];
	}

	if(sscanf(id,"%s hide",str)==1)
	{
		if(get_player(str))
			return pai_hide[str];
	}
	return 0;
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

string id_to_name(string id)
{
	object ob;
	string str;

	if(id == DESK)
		return "牌盒";
	if(id == DESK2)
		return "副牌盒";

	if(sscanf(id,"%s hand",str)==1)
	{
		ob = get_player(str);
		if(ob)
			return ob->name()+"手上";
	}

	if(sscanf(id,"%s out",str)==1)
	{
		ob = get_player(str);
		if(ob)
			return ob->name()+"面前";
	}

	if(sscanf(id,"%s save",str)==1)
	{
		ob = get_player(str);
		if(ob)
			return ob->name()+"身边";
	}

	if(sscanf(id,"%s hide",str)==1)
	{
		ob = get_player(str);
		if(ob)
			return ob->name()+"隐藏";
	}
	return "???";
}

int sizeof_pai(mixed* p)
{	
	return p==0?0:p[0];
}

int valid_show(object who,string which)
{
	// 设置观看权限 0 - hide 1 - show
	string id,temp;
	if(!has_start)
		return 1;

	if(sscanf(which,"%s %s",id,temp)==2)
	{
		if(who->query("id")==id)
			return 1;
		if(temp == "out")
			return 1;
		if(temp == "save")
			return 1;
	}
	return 0;
}

string view_pai(object who,string which)
{
	mixed* pai;
	int /*show_all,*/i/*,j*/;
	string s,p;

	pai = get_pais(which);

	if(pai==0)
		return 0;
 
	if(sizeof_pai(pai)==0)
		return "没有牌。";

	if(valid_show(who,which))
	{
		s = "";
		for(i=0;i<pai[0];i++)
		{
			p = id_to_pai(pai[i+1]);
			s+= p +" ";
		}
		return s;
	}
	else
		return sizeof_pai(pai)+"张牌";
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
		return notify_fail("没有设置好顺序。请参阅帮助。\n");
	if(this_player()->query("id")!=id)
		msg(this_player()->name()+"对"+ob->name()+"说道：到你了。\n");
	else
		msg(this_player()->name()+"对自己说道：到我啦！\n");
	return 1;
}

int do_shunxu(string arg)
{
	int i;
	string* p;
	string who;

	if(arg==0)
		return notify_fail("没有指定的人？\n");
	p = explode(arg,"->");

	who = "";
	for(i=0;i<sizeof(p);i++)
	{
		if(get_player(p[i]))
		{
			if(who =="")
				who = p[i];
			else
			{
				msg(who+"->"+p[i]+"\n");
				player[who]=p[i];
				who = p[i];
			}
		}
		else
			return notify_fail(p[i]+"没有加入牌局啊！\n");
	}
	return 1;
}

int do_removej(string arg)
{
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	do_movepai("JB from desk to desk2");
	do_movepai("JS from desk to desk2");
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
	msg(this_player()->name()+"说道："+arg+"\n");
	old = who_play;
	who_play = player[who_play];

	if(mode == "21")
	{
		key = keys(player);

		for(i=0;i<sizeof(key);i++)
			if(player[key[i]]==old)
				player[key[i]] = player[old];
		player[old] = "";
				
		if(player[who_play] == "")
		{
			msg("大家都不要了。\n");
			finish_21();
			return 1;
		}
	}
	
	do_nextone("");
	return 1;
}

int do_now(string arg)
{
	if(!is_playing(this_player()))
		return notify_fail("你都不玩牌啊！\n");

	if(!arg)
		return notify_fail("格式：now who\n");

	if(get_player(arg))
		who_play = arg;
	do_nextone("");
	return 1;
}

int do_end(string arg)
{
	mixed* pai;
	string* p;
	int i;
//	object ob;

	if(!is_playing(this_player()))
		return notify_fail("你都不玩牌啊！\n");

	if(!has_start)
		return notify_fail("游戏还没有开始啊！\n");

	if(mode == "21")
		return 1;

	if(mode == "8")
	{
		pai = get_pais(this_player()->query("id")+" hand");

		if(!pai||sizeof_pai(pai)!=0)
			return notify_fail("还没有摆完啊！\n");
		
		msg(this_player()->name()+"说道：摆完牌了！！\n");
		if(player[this_player()->query("id")]!="F")
		{
			player[this_player()->query("id")]="F";
			player_counter ++;
		}

		if(player_counter==sizeof(player))
		{
			// show all
			p = keys(player);
			for(i=0;i<sizeof(p);i++)
				do_movepai("1+1+1+1+1+1+1+1 from "+p[i]+" hide to "+p[i]+" out");
		}
	}
	else
	{
		msg(this_player()->name()+"说道：出完牌了！！\n");
		who_play = "完了";
	}
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

void msg(string msg)
{
	tell_room(environment(this_object()),msg,0);
}

void auto_order()
{
	int i;
	string* key;
	string order;

	key = keys(player);
	order = "";
	for(i=0;i<sizeof(key);i++)
		order+= key[i]+"->";	
	order+=key[0];
	do_shunxu(order);
	msg("如果顺序不合适请使用order命令重新设置。\n");
}

int do_setmode(string arg)
{
	int vmode = 0/*,i*/;
//	mixed* inv;
	
	if(!arg)
		return notify_fail("setmode [模式] 请参照帮助。\n");

	if(!is_playing(this_player()))
		return notify_fail("你都不玩牌啊！\n");

	if(!has_start)
		return notify_fail("游戏还没有开始啊。\n");

	if(mode)
	{
		if(mode=="21"&&arg=="auto")
		{
			mode2 = "auto";
			msg("进入自动模式。\n");
			return 1;
		}

		if(arg=="man"&&mode=="21")
		{
			mode2 = 0;
			msg("进入手动模式。\n");
			return 1;
		}
		return notify_fail("已经进入了模式，请使用reset pai重置。\n");
	}

	mode = arg;
	if(mode=="8")
	{
		vmode = 1;
		msg(HIR"进入8张模式。\n"NOR);
		has_start = 0;
		do_removej("");
		has_start = 1;
	}

	if(mode=="21")
	{
		vmode = 1;
		msg(HIR"进入21点模式。\n"NOR);
		has_start = 0;
		do_removej("");
		has_start = 1;
		auto_order();
		save_player_data();
	}
	
	if(mode == "d2")
	{
		vmode = 1;
		msg(HIR"进入锄大2模式。\n"NOR);
		has_start = 0;
		do_removej("");
		has_start = 1;
		auto_order();
	}

	if(!vmode)
	{
		mode = 0;
		return notify_fail("现在不支持该模式\n");
	}
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

	tell_room(environment(this_player()),r,0);
	return 1;
}

void press_counter(string id,int num)
{
	counter[id]=counter[id]+num;
}

int do_press(string arg)
{
	string id;
	int n;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩牌啊！\n");

	if(sscanf(arg,"%s %d",id,n)!=2)
		return notify_fail("格式：press id number。如：press catyboy 10\n");
	
	press_counter(id,n);
	do_showc("");
	return 1;
}

int do_removec(string arg)
{
	string id;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩牌啊！\n");

	if(!arg||sscanf(arg,"%s",id)!=1)
		return notify_fail("格式：removec id\n");

	map_delete(counter,id);
	do_showc("");
	return 1;
}

int do_paipai2(string arg)
{
//	int i;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩啊！\n");

	if(!has_start)
		return notify_fail("游戏还没有开始。\n");

	if(mode == "8")
		do_paipai("8");
	return 1;
}

int do_daopai(string arg)
{
//	int i;
	
	if(!is_playing(this_player()))
		return notify_fail("你都不玩，开始什么啊！\n");

	if(!has_start)
		return notify_fail("游戏还没有开始。\n");

	do_movepai("1 from desk to desk /h");
	return 1;
}

mapping t()
{
	return player;
}

mapping t2()
{
	return player_data;
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
	for(i=0;i<sizeof(inv);i++)
		player_data[inv[i]] = player[inv[i]];
}

void restore_player_data()
{
	int i;
	string* key;
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
		inv2[i] = str + ":" + c21(get_pais(str+" out"));
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

		if(mode2 == "auto")
		{
			press_counter(id,fen);
		}
	}
	r += "－－－－－－－－－－－－－－－－－\n";
	msg(r);
	who_play = 0;
}
