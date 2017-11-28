inherit ROOM;

void create()
{
        set("short", "青石路" );
        set("long", @LONG
一条青石铺成的路，平坦宽阔，路的两面。绿树成荫，来
往的人累了都到树下去乘乘凉，歇歇脚，一些小贩也乘机在这
里买点吃喝的东西。
LONG);
        set("exits", ([
  		"east" : "/d/jingzhou/jzximen",
  		"west" : __DIR__"shudao2",
   	]));

        set("no_clean_up", 0);
        set("outdoors", "chengdu");
        setup();
        replace_program(ROOM);
}

