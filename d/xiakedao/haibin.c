// Room: /d/xiakedao/hanbin.c

inherit BUILD_ROOM;

void create()
{
	set("short", "南海之滨");
	set("long", @LONG
这里就是大陆的南端，向南望去是一望无际的碧海，与辽
阔的蓝天相映，让人顿生渺小之感。湛蓝海水、岸边礁石、浪
拍沙滩卷起层层细沫，阳光绕出白云尽情笼照青草绿树，让人
心生退隐江湖之意，只想在此隐居修行，追求武道至高境界。
LONG );
        set("outdoors", "nanhai");
	set("exits", ([
                "north" : __DIR__"xkroad4",
                "west"  : __DIR__"zhuwu",
	]));
        set("objects", ([
                __DIR__"npc/sun" : 1, 
        ]));
        set("max_room", 3);
	setup();
        replace_program(BUILD_ROOM);
}
