inherit ROOM;

void create ()
{
  set ("short", "南厢房");
  set ("long", @LONG
这里是王维扬的大儿子王剑英的住处。王家的家教极严，王剑英每天早上
要练功，下午有空时还要读书。屋里陈设绝没有富家的奢华，墙上挂着一柄金
刀和几幅字画，桌上放着三两部书，连床帐都只是青布的。
LONG);

  	set("exits", ([
  		"north" : __DIR__"stone_road4",
	]));

  	set("objects", ([
                 CLASS_D("zhenyuan") + "/wangjianying" : 1,
        ]));

  	setup();
        replace_program(ROOM);
}