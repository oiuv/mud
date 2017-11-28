inherit ROOM;

void create()
{
        set("short", "三清殿");
        set("long", @LONG
三清殿供奉的是三清神像，不过开封府内的居民大多到大
相国寺去烧香还愿了，这里的香火并不旺。神像也蓬头垢面无
人理会。西行去有座高高的阁楼，就是玉皇阁。
LONG
        );
        set("objects", ([
  		__DIR__"npc/obj/sanqingxiang" : 1,
  		__DIR__"npc/xianghuo" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"yanqing",
  		"west" : __DIR__"yuhuang",
	]));

        setup();
        replace_program(ROOM);
}
