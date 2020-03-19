inherit ROOM;

void create()
{
        set("short", "地牢");
        set("long", @LONG
这间地牢在监狱的最下面，但却有淡淡的阳光透入。地牢中
间，一个身影手持铁链，傲然站在石柱旁。日光透将进来，只见
那人满脸花白胡，身材魁梧，背脊微弓，倒似这间小小石室装不
下他这个大身子似的，眼光耀如闪电，威猛无俦。 
LONG );
        set("no_clean_up", 0);
        set("exits", ([
                "out" : __DIR__"didi",
        ]));
        set("objects", ([
                CLASS_D("lingxiao") + "/baizizai" : 1,
        ]));

        setup(); 
        replace_program(ROOM);
}

