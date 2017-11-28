inherit ROOM;

void create()
{
        set("short", "开封铁塔");
        set("long", @LONG
塔高五十五米，八角十三层。当年此地为宋开宝寺，故又
名『开宝寺塔』，塔身为褐色琉璃砖砌成混私铁铸，民间俗称
其为铁塔。塔身修长，气势雄伟，砖面饰以飞天、佛像、乐伎
等数十种图案，栩栩如生。
LONG);
        set("outdoors", "kaifeng");
        set("exits", ([
		"west" : __DIR__"jieying",
		"east" : __DIR__"eroad3",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/luo" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
