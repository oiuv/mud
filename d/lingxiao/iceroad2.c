inherit ROOM;

void create()
{
        set("short", "冰道");
        set("long", @LONG
这里是凌霄城的南街，凌霄城的弟子、亲人、家属，尽皆居
住在城里。凌霄城自创派以来一百余年，历代先祖皆是饱学逍遥
之士，以老子之黄庭为铭，避人间之烦嚣，享高处之清寒，是以
凌霄弟子居此西域冷僻之地，仍能生生不息。这里人来人往，西
面是一家刀剑铺，东边是一家药铺。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"south" : __DIR__"iceroad1",
            	"north" : __DIR__"iceroad3",
            	"west"  : __DIR__"wuqi",
            	"east"  : __DIR__"yaodian",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

