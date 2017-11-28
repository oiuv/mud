inherit BUILD_ROOM;

void create()
{
        set("short", "玉皇山路");
        set("long", @LONG
山路崎岖，曲折蜿延。四周林木苍翠，修竹茂密。山路旁
有一山洞，据说洞里有时会传出虎哮声，故名老虎洞，虽然如
此，景色如此宜人，怎能不让人心生长住之意？西边是下山的
路往东下山便到了山底。
LONG);
        set("exits", ([
            	"eastup"  : __DIR__"yuhuangsd",
            	"westdown": __DIR__"yuhuangshan",
        ]));
        set("objects", ([
            	"/clone/quarry/laohu" : 1,
        ]));
        set("outdoors", "hangzhou");
        set("max_room", 4);
        setup();
        replace_program(ROOM);
}
