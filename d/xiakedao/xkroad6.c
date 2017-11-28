// Room: /d/xiakedao/xkroad6.c
// Modified by rcwiz
inherit ROOM;

void create()
{
//      object ob;

	set("short", "渔村小屋");
	set("long", @LONG
小村的渔民小屋十分简陋，几乎没什么家当，壁上挂满了早用旧
了的渔具。大概这里的人都出海了。
LONG );
	set("exits", ([
		"south"   : __DIR__"xkroad5",
	]));
               
	set("objects", ([
		  "/kungfu/class/xiakedao/zhangsan2" : 1,
	]));
           
        
	setup();
}