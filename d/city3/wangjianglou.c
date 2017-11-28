inherit ROOM;

void create()
{
	set("short", "望江楼");
	set("long", @LONG
望江楼又名崇丽阁。下两层四角，上两层八角，朱柱琉瓦
翘角飞甍，雕梁画栋，登临其上，远眺府南河，清风扑面，舟
火穿梭，实为胜景。楼的周遭，翠竹千茎朝天，每当雨雾氤氲
轻烟笼翠，竹籁鸟音，动人心魄。楼前薛涛井，传说因为薛涛
漂洗一种红色诗笺而流芳千古：无波古井因涛重，有色遗笺举
世珍。这也是这一才女的传世的唯一遗泽。
LONG);
        set("outdoors", "chengdu");
	set("exits", ([
	    	"northwest" : __DIR__"eastroad3",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
