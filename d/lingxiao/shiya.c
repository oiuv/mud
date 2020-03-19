inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
转过山梁，几块青石相互交搭，组成了一个避风的石崖。外
面朔风飞扬，里面却炉火熊熊，松木流爆，传来丝丝烤肉的香味，
凌霄弟子巡山至此，常在这里避风休憩。旁边有个小店，疲累饥
渴时，可在里面稍事休息。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            "westdown"  : __DIR__"sroad3",
            "east"  : __DIR__"bar", 
            "northup"  : __DIR__"sroad4",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

