// tieyanling.c 铁焰令

inherit ITEM;

void create()
{
        set_name("铁焰令", ({"tieyan ling", "tieyan", "ling"}));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "面");
                set("long","这是一面黑黝黝的令牌，由教主签发，凭此可向尊长挑战。\n");
                set("material", "steel");
        }
}

