// Room: /d/shaolin/zhushe.c
// Date: YZC 96/01/19
// Dat:  Cleansword 96/02/20

inherit ROOM;

int do_remove();
void fainting(object me, object ob);
string look_stone();

/* (move stone) 猪舍石块下埋着奄奄一息的乔三槐。告诉你
金刚伏魔圈前半段的走法(western)，说完头一歪，死了。如玩家
学过内功，可用所学内功中(life heal)之法延续乔三槐一口气，
令其说出后半段走法(news)，并且告知出迷宫走法藏在厨房某处，
未及说完何处就死了。玩家自己找出何处（灶头里，可以钻进去，
里面有一块砖，上刻出迷宫走法）。*/

void create()
{
	set("short", "猪舍");
	set("long", @LONG
这是间破烂的农家猪舍。圈里养着几头瘦猪，泔槽已经干涸了，
草料也开始发霉腐烂。由于好多天没人清理牲口的粪便，满屋子弥
漫着一股恶臭。屋角堆了一大堆石块(stone)，足有半人高。
LONG );
	set("exits", ([
		"southeast" : __DIR__"houshan",
	]));
	set("item_desc",([
		"stone"		:	(: look_stone :),
	]));
	set_temp("available", 1);
	setup();
}

void init()
{
	add_action("do_move", "move");
}

int do_move(string arg)
{
//	string dir;
	object me,ob;

	if( !arg || arg=="" || !query_temp("available") ) return 0;

	if( arg=="stone" && query_temp("available")) {
		write("你试著把石块一块块地搬开，突然发现下面埋着个奄奄一息的老人 !\n\n");
	        delete_temp("available");
	}


	me = new(__DIR__"npc/lao-qiao",1);
	me->move(__DIR__"zhushe");

	ob = this_player();	

	message_vision("老人断断续续地说道: 我是乔三槐，快...，快往北山上走...，
进了松林...，往南...，往东...，往西...，往东...，再往北......\n\n", ob);

	message_vision("乔三槐嘴唇动了动，似乎还想说些什麽，却因伤重难支，昏死了过去。\n", ob);

	me->unconcious();

	remove_call_out("fainting");
	call_out("fainting", 20, me, ob);

	return 1;
}

void fainting(object me, object ob)
{
	if (! me || ! ob || environment(me) != this_object() ||
	    environment(ob) != this_object())
		return;

	if ( (int)me->query("qi") <= 50 ) 
	{
		message_vision("乔三槐缓缓苏醒了过来，说道: 谢...谢......。\n",ob);
		me->die();
	}
	else
	{
		message_vision("\n乔三槐醒了过来，说道: 再往北，往东，往西，南......出路在砖......\n\n",ob);
		message_vision("说罢脑袋便软软地垂了下去......",ob);
		me->die();
	}

	return;
}

string look_stone()
{
	return "这是一大堆石块，堆在墙脚边，不知是派什麽用场。\n";
}