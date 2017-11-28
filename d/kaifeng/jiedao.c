inherit ROOM;

void create()
{
        set("short", "御街");
        set("long", @LONG
这条道横贯南北，北到宣德门，南至南盈门，是以前皇上
出巡时常走的道，所以修得是格外平整。道两边店铺不断。向
南再过去不远。就是开封府大堂。北面是大相国寺。
LONG
        );
        set("no_clean_up", 0);
        set("exits", ([
		"south" : __DIR__"jiedao1",
		"north" : __DIR__"xianguosi",
	]));
        set("outdoors", "kaifeng");
        set("objects", ([
		__DIR__"npc/fujiazi" : 1,
		__DIR__"npc/qigai" : 1,
	]));

        setup();
        replace_program(ROOM);
}
