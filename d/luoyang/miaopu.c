inherit ROOM;

void create()
{
	set("short", "苗铺");
	set("long", @LONG
未入此处，清新的花香已沁人心裨。苗铺中陈列着各种名花，玲琅满
目，令人目不暇接。其中虽不乏珍奇异种，但是最吸引人的还是一簇簇盛
放的牡丹，天下花卉以牡丹为王，而牡丹之中又以洛阳牡丹为尊，怪不得
这里的生意总是那么的兴旺，既有外来游客，也有当地居民，来客不分高
低贵贱，这里的主人总是笑脸相迎。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"miaoyuan",
  		"west" : __DIR__"sroad7",
	]));
        set("objects", ([
                __DIR__"npc/huanong" : 1,
        ]));

	setup();
	replace_program(ROOM);
}
