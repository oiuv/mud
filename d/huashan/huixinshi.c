// huixinshi.c

inherit ROOM;

void create()
{
        set("short", "回心石");
        set("long", @LONG
从青柯坪沿石阶上山，山路到此而尽，前面山势险恶，石崖间仅有窄
窄的石阶犹如天梯耸立，两边铁链斜悬，令人不寒而栗，不敢前行。北壁
下大石当路，此石因此叫做回心石，再上去山道奇险，游客至此，就该回
头了。
LONG );
        set("exits", ([ /* sizeof() == 2 */
            "westdown" : __DIR__"qingke",
            "eastup"   : __DIR__"qianchi",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "huashan" );

        setup();
        replace_program(ROOM);
}
