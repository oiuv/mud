#include <ansi.h>

inherit ITEM;

void setup()
{}

void init()
{
        add_action("do_read", "see");
}

void create()
{
        set_name( YEL "铜牌" NOR, ({"tong pai"}));

        set("unit", "面");
        set("long", YEL "这是一面四四方方的铜牌,上面刻着:“千蛛万毒”四个大字。\n" NOR
                    "铜牌背面好象雕着一些细细的花纹，需要仔细看(see)才能勉强看清楚。\n" );
        set("value", 50);
        set_weight(200);
        
        setup();
}

int do_read(string arg)
{
        return notify_fail(YEL "                      \n"
"                                   ^                 \n"
"                                @@^ ^     ^          \n"
"                                 ^ ^ ^   ^ ^@@@      \n"
"                              @@@@^ ^ ^ ^ ^ ^        \n"
"                               ^ ^ ^ ^ ^ ^ ^ ^       \n"
"                              ^ ^ ^ ^ ^ ^ ^ ^ ^      \n"
"                             ^ ^ ^ ^O^ ^O^ ^O^ ^     \n"
"                            ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^    \n"
"                           ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^   \n"
"                          ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^  \n" NOR );
}


