inherit ROOM;

void create()
{
        set("short", "钟亭");
        set("long", @LONG
钟亭内设铁钟一口，重九千斤。每逢山洪暴发，鸣钟镇洪，
亦以示警，声闻二十里外。 
LONG);
        set("exits", ([
               "west"   : __DIR__"kuixingge",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

