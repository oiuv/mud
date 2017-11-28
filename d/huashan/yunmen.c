// yunmen.c

inherit ROOM;

void create()
{
        set("short", "云门");
        set("long", @LONG
过莎萝坪，是华山十八盘。十八盘的尽处就是“云门”了。这里刻着
“仙境”、“天下第一名山”等石刻。云门之内的小盆地就是青柯坪。
LONG
        );
        set("exits", ([ /* sizeof() == 2 */
            "northdown" : __DIR__"shaluo",
            "southup" : __DIR__"qingke",
        ]));

        set("no_clean_up", 0);
        set("outdoors", "huashan" );

        setup();
        replace_program(ROOM);
}
 
