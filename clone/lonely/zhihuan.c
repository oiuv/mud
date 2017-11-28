#include <weapon.h>
#include <ansi.h>
#include <armor.h> 
inherit HANDS; 

void create()
{
        set_name(HIM "逍遥神仙环" NOR, ({ "shenxian huan" , "xiaoyao" , "shenxian", "huan" }) );
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "枚");
                set("long", HIM "散发着古朴光泽的玉斑指，这便是逍遥掌门人信物逍遥神仙环。\n" NOR);
                set("value", 800000);
                set("no_sell", "…嗯…这东西珍是够珍贵，可是年代久远，我难以估价。");
                set("material", "steel");
                set("armor_prop/armor", 30);
        	set("armor_prop/hand", 50);
        	set("armor_prop/strike", 50);
        	set("armor_prop/unarmed_damage", 100);
	        set("wear_msg", HIM "$N" HIM "微微一笑，轻轻戴上一枚玉斑指，顿时指尖光华四射。\n" NOR);
        	set("remove_msg", HIM "$N" HIM "将逍遥神仙环从指尖取了下来。\n" NOR);
                set("stable", 100);
        }
        setup();
}
