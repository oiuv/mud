inherit ROOM;

void create()
{
	set("short", "万景山庄");
	set("long", @LONG
在虎丘山东面就是万景山庄，是一个较大的盆景园，有盆
名为“秦汉遗韵”的圆柏，树龄已逾五百年，被誉为“盆景之
王”。还有盆景为“云蒸霞蔚”的树石盆景和另一盆四百多年
的雀梅古桩盆景，都是盆景艺术的中的珍品。圆内景色优美，
颇富园林雅趣。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"west"  : __DIR__"shijianshi",
		"east"  : __DIR__"toumenshan",
		"north" : __DIR__"hanhanquan",
	]));
        set("objects", ([
		"/d/taishan/npc/dao-ke" : 1,
	]));
	setup();
	replace_program(ROOM);
}

