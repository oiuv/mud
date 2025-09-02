// talk 命令 - 与AI NPC对话

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int main(object me, string arg) {
    string npc_name, message;
    object npc;

    if (!arg || arg == "") {
        return notify_fail("指令格式：talk NPC [内容]\n");
    }

    // 解析参数 - 支持about语法处理带空格的NPC名字
    if (sscanf(arg, "%s about %s", npc_name, message) == 2) {
        // 使用about语法成功解析
    } else if (sscanf(arg, "%s %s", npc_name, message) != 2) {
        npc_name = arg;
        message = "你好";
    }

    // 查找NPC
    npc = present(npc_name, environment(me));
    if (!npc) {
        return notify_fail("这里没有" + npc_name + "。\n");
    }

    // 检查是否是AI NPC
    if (!function_exists("accept_talk", npc)) {
        return notify_fail(npc->name() + "似乎不想和你聊天。\n");
    }

    // 发送对话请求
    if (npc->accept_talk(me, message)) {
        write("你对" + npc->name() + "说：" + message + "\n");
        return 1;
    }

    return notify_fail("对话失败。\n");
}

int help(object me) {
    write(@HELP
指令：talk
格式：talk NPC 内容 或 talk NPC ID about 内容

这个指令让你与游戏中的智能NPC进行对话。
NPC会根据你的对话内容、当前环境、时间天气等因素
给出符合其性格特点的回答。

支持带空格的NPC名字，使用about作为分隔符。

示例：
  talk libai 你会作诗吗？
  talk libai 今日天气如何？
  talk zhou butong about 如何拜师？

注意：只有标记为AI的NPC才能进行智能对话。
HELP);
    return 1;
}
