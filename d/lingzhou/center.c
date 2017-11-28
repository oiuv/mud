// Room: /lingzhou/center.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "城中心");
	set("long", @LONG
这里是西夏都城灵州的中心广场，也是四条大街的交汇处，北面是
皇城，南面是商业繁华地段，西面是普通商人区和骠骑营，东面衙门和
王公贵族们的府第。灵州是西域最大的物资集散地和商业中心，也是西
域通往中原的必经之地。各色人等来来往往，马嘶人喊，热闹非凡，广
场空地上卖艺的、要饭的、大腹便便的财主、提笼携鸟的王公贵戚到处
都是，偶尔也有行色匆匆的江湖人士一晃而过。
LONG );
	set("exits", ([
		"south" : __DIR__"nandajie",
		"north" : __DIR__"beidajie",
		"east"  : __DIR__"dongdajie",
		"west"  : __DIR__"xidajie",
	]));
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

