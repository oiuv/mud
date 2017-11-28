#include <weapon.h>
#include <ansi.h>
#include <armor.h> 
inherit HANDS; 

void create()
{
        set_name(HIY "琥珀神环" NOR, ({ "hupo shenhuan" , "hupo" , "shenhuan", "huan" }) );
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "枚");
                set("long", HIY "散发着古朴光泽的指环，这便是燕子邬主人慕容"
                            "博的信物琥珀神环。\n" NOR);
                set("value", 800000);
                set("no_sell", "…嗯…这东西珍是够珍贵，可是年代久远，我难以估价。");
                set("material", "steel");
                set("armor_prop/armor", 30);
        	set("armor_prop/finger", 50);
        	set("armor_prop/strike", 50);
        	set("armor_prop/unarmed_damage", 100);
	        set("wear_msg", HIY "$N" HIY "微微一笑，轻轻戴上一枚琥珀神环，顿"
                                "时指尖光华四射。\n" NOR);
        	set("remove_msg", HIY "$N" HIY "将琥珀神环从指尖取了下来。\n" NOR);
                set("stable", 100);
        }
        setup();
}
