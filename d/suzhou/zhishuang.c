inherit ROOM;

void create()
{
	set("short", "致爽阁");
	set("long", @LONG
在千人石西面就是致爽阁，又名伏虎阁，在虎丘塔的西南
面，是山上的最高点。阁名取“四山爽气，日夕西来”之意。
旧称“小五台”，是海涌峰顶。阁外平台宽阔，俯瞰沃野；远
眺群峰逶迤，可赏著名上午“狮子回头看虎丘”一景。深秋季
节观成群飞翔的苍鹰，蔚为壮观。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
                "north" : __DIR__"shijianshi",
		"south" : __DIR__"qianrenshi",
	]));
	set("objects", ([
		__DIR__"npc/lady1" :1,
	]));
	setup();
	replace_program(ROOM);
}

