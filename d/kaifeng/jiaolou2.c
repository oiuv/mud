inherit ROOM;

void create()
{
        set("short", "东角楼");
        set("long", @LONG
东角楼是平时驻兵来守望的地方。一般只在楼的顶端挂了
个气死风灯。日夜有人值守。从此向西下是朱雀门，东下是东
大街，你眺目远处。湖泊，楼阁，真是大好江山。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"westdown" : __DIR__"zhuque",
  		"eastdown" : __DIR__"eroad2",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
