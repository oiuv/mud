#include <ansi.h>

int main(object me, string arg)
{
    object env = environment(me);
    string outdoors = env->query("outdoors");
    string *no_recall = ({"gaochang"});
    int x, y;

    if (!outdoors || member_array(outdoors, no_recall) != -1)
        return notify_fail(HIR "你所在环境不能使用recall指令😂\n" NOR);
    if (env->is_area())
        return notify_fail(HIR "你目前不能使用recall指令😅\n" NOR);
    if (env->query("maze"))
        return notify_fail(HIR "你目前不能使用recall指令😱\n" NOR);

    debug(outdoors);
    switch (outdoors)
    {
    case "beijing":
        x = 69;
        y = 47;
        break;
    case "changan":
    case "huashan":
        x = 59;
        y = 63;
        break;
    case "chengdu":
    case "qingcheng":
        x = 50;
        y = 74;
        break;
    case "city":
        x = 75;
        y = 69;
        break;
    case "dali":
        x = 44;
        y = 86;
        break;
    case "emei":
        x = 50;
        y = 75;
        break;
    case "foshan":
        x = 64;
        y = 95;
        break;
    case "fuzhou":
        x = 74;
        y = 86;
        break;
    case "hangzhou":
    case "jiaxing":
        x = 77;
        y = 75;
        break;
    case "hengshan":
    case "hengyang":
        x = 64;
        y = 84;
        break;
    case "jingzhou":
        x = 62;
        y = 75;
        break;
    case "kaifeng":
        x = 66;
        y = 61;
        break;
    case "kunlun":
    case "mingjiao":
        x = 33;
        y = 59;
        break;
    case "kunming":
        x = 47;
        y = 90;
        break;
    case "lanzhou":
        x = 49;
        y = 60;
        break;
    case "lingjiu":
    case "xingxiu":
    case "tianshan":
        x = 24;
        y = 34;
        break;
    case "lingzhou":
        x = 53;
        y = 53;
        break;
    case "luoyang":
        x = 66;
        y = 62;
        break;
    case "nanyang":
    case "ruzhou":
        x = 64;
        y = 67;
        break;
    case "quanzhou":
        x = 73;
        y = 89;
        break;
    case "shaolin":
        x = 66;
        y = 66;
        break;
    case "suzhou":
        x = 76;
        y = 73;
        break;
    case "taishan":
        x = 71;
        y = 58;
        break;
    case "wudang":
        x = 61;
        y = 68;
        break;
    case "xiangyang":
        x = 62;
        y = 70;
        break;
    case "xiyu":
        x = 21;
        y = 36;
        break;
    case "yili":
        x = 19;
        y = 38;
        break;
    default:
        x = random(100);
        y = random(100);
    }

    return area_move(load_object("/world/area/world"), me, x, y);
}
