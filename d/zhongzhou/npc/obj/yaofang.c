inherit ITEM;

void create()
{
set_name("残破药方", ({"yaofang"}));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
set("unit", "张");
set("material", "paper");
        }
setup();
}

