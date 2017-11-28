#include <ansi.h>

inherit ROOM;

string look_ge();

void create()
{
        set("short", "紫竹轩");
        set("long", @LONG
到得此处，阵阵泥土的清香扑面而来，放眼四周只见不远
处有一露天亭阁(ting ge)掩映于翠竹之下。
LONG);

        set("item_desc",([
                "ting ge" : (: look_ge :),
                "ting"    : (: look_ge :),
                "ge"      : (: look_ge :),
        ]));

        set("exits", ([
               "south"  : __DIR__"huayuan",
               "east"   : __DIR__"zhulin4",
        ]));

        set("objects", ([
              CLASS_D("jueqing") + "/zhi" : 1,
        ]));

        set("no_clean_up", 0);

        setup();
        //replace_program(ROOM);
}

string look_ge()
{
        return HIC "\n但见亭阁掩映于翠竹之下，之上立有一横匾，上书："
               HIG "\n\n"
        "\t\t※※※※※※※        \n"
        "\t\t※※※※※※※        \n"
        "\t\t※※      ※※        \n"
        "\t\t※※" NOR + MAG "　紫 " HIG " ※※\n" HIG    
        "\t\t※※　 　 ※※        \n" HIG 
        "\t\t※※" NOR + MAG "　竹 " HIG " ※※\n" HIG    
        "\t\t※※　 　 ※※        \n" HIG
        "\t\t※※" NOR + MAG "　轩 " HIG " ※※\n" HIG
        "\t\t※※      ※※\n"     
        "\t\t※※※※※※※\n" HIG
        "\t\t※※※※※※※\n\n" NOR;

}
