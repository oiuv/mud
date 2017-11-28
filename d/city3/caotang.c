inherit ROOM;

void create()
{
	set("short", "杜甫草堂");
	set("long", @LONG
这里是杜甫流寓成都的故居。草堂里流水回萦，小桥勾连
竹树掩映，显得既庄严肃穆，古朴典雅，又不失幽深静谧，秀
丽清朗。
LONG);
        set("outdoors", "chengdu");
	set("no_clean_up", 0);
	set("exits", ([
		"south"  : __DIR__"path2",
	]));
	setup();
	replace_program(ROOM);
}
