//棋苑

#include <ansi.h>
inherit  ROOM;

string look_string();

void  create  ()
{
	set  ("short",  "棋苑");
	set  ("long", 
	"棋苑共分四个大间，是手谈休栖的好地方。这里的南北和东三个方
向各有一间棋室，在每个棋室的门外都贴着"HIY"请勿打扰棋局"NOR"的牌子。\n");

	set("no_dazuo",1);
	set("no_kill",1);
	set("no_fight",1);
	set("no_steal",1);
	set("no_beg",1); 	
	set("item_desc", ([
		"help" : ( : look_string : ),
	]));

	set("exits",  ([
		"east"  :  __DIR__"qiyuan2",
		"south"  :  __DIR__"qiyuan3",
		"north"  :  __DIR__"qiyuan4",
		"west" : "/d/city/liaotian",
	]));

	set("objects",  ([
		//__DIR__"obj/cch"  :  1,
		"/clone/game/fxq":1, 
		"/clone/game/seaf":1, 
	]));

	setup();
}

string look_string()
{
	string  msg  =  "欢迎到棋苑来下棋！\n"  +
"
在这里您可以下围棋或五子棋，以下是下棋的步骤：
一、先找好对手，然后分别用  sit black  和  sit white  入座；
二、使用 new 开始一盘新的棋局：new [-5] [-b(numbers)] [-h(numbers)]
    其中 -5  代表下五子棋，不选即为下围棋；
      　 -b  指定所用棋盘的大小；
         -h  指定让子的数目；
　　例如：
　　围棋 new
    让九子围棋：new -h9
    十五乘十五的五子棋：new -5 -b15
三、使用 play 轮流走棋
    例如 play d4 等等。
四、使用 refresh 观看棋盘。
五、使用 leave 离开棋盘。
六、使用 pass 弃子认输。
七、使用 undo 悔棋。目前只提供五子棋的悔棋功能。

";
	return  msg;
}

int valid_leave(object me, string dir)
{
        object room;
        mapping exit;

        exit = environment(me)->query("exits");

        if ( dir == "south" || dir == "north" || dir == "west" ) {
                if( !( room = find_object(exit[dir])) )
                       room = load_object(exit[dir]);
	        if( room->query_temp("action")  ==  1 )
                       return notify_fail("那间棋室已经有人开始下棋了，请勿打扰\n");
                }

        return ::valid_leave(me, dir);
}
