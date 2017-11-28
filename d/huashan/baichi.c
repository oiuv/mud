// baichi.c

inherit ROOM;

void create()
{
        set("short", "百尺峡");
	set("long", @LONG
走过千尺幢，前面又见另一要命的百尺峡，百尺峡不似千尺幢般险峻
，但亦十分陡峭，岩壁两侧设有铁索以作扶拦。百尺峡又称百丈崖，是一
座壁立千仞的悬崖。崖底到上面的最低的垭口处约百尺，故有是名。
LONG );
        set("exits", ([ /* sizeof() == 2 */
            "northdown" : __DIR__"qianchi",
            "eastup"    : __DIR__"pingxinshi",
        ]));

        set("outdoors", "huashan" );

        setup();
        replace_program(ROOM);
}
 
