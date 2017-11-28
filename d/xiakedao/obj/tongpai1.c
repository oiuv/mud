//tongpai1.c
//edit by noz

inherit ITEM;

void create()
{
        set_name( "赏善铜牌", ({"shan pai"}));
        set_weight(100);

        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("long", "这是一块闪闪发光的白铜片子，约有巴掌大小，牌子正"
                            "面刻着一张笑脸，和蔼慈祥。\n");
                set("value", 100);
        }

        setup();
}
